const response = require("@teamPleno/response");
const modelScore = require("./student_score_detail.model");
const { arrayGroupBy } = require("./helpers");

exports.handlerStudentScoreDetail = async (filter) => {
  try {
    const aItems = await modelScore.getScoreItems({ user: filter?.user, schoolId: filter?.schoolId, origenDatos: filter?.origenDatos, assessmentId: filter?.assessmentId, colegioDemo: filter?.colegioDemo });

    let groupByAreaItems = arrayGroupBy(aItems, "area");
    const performances = await modelScore.findPerformanceLevel();
    const gs = await assessments(filter, performances);

    const [comp] = await Promise.all([evaluaciones(filter)]);
    let groupByAssessment = arrayGroupBy(comp, "evaluacion");

    groupByAssessment = Object.entries(groupByAssessment).map(
      ([key, value]) => {
        let groupByArea = arrayGroupBy(value, "area");
        groupByArea = Object.entries(groupByArea).map(
          ([key, area]) => {
            let groupByComponent = arrayGroupBy(area, "componente");
            groupByComponent = Object.entries(groupByComponent).map(
              ([key, componente]) => {
                return {
                  nombre: key,
                  competencias: componente.map((value) => {
                    return {
                      nombre: value.competencia,
                      puntuacion: value.puntuacion,
                      curso: value.curso
                    }
                  }),
                }
              })
            return {
              nombre: key,
              componente: groupByComponent
            }
          })
        return {
          // assessmentName: key,
          areas: groupByArea
        }
      })


    const comparation = await assessmentComparation(gs.map((x) => {
      return {
        assessmentId: x.assessmentId,
        assessmentName: x.assessmentName,
        studentScore: x.globalScore,
      }
    }), filter?.user, filter?.schoolId);
    return {
      data: {
        assessments: gs,
        areaCompetences: groupByAssessment,
        areaItems: Object.entries(groupByAreaItems).map(([area, items]) => {
          return {
            area: area,
            items: items.map((item) => {
              delete item.area;
              return item;
            }),
          };
        }),
        comparation: comparation,
      }
    };
  } catch (error) {
    console.error(error);
    return response(500, error);
  }
};

async function assessments(filter, performances) {
  const modelAssessments = await modelScore.findGlobalScoreByStudent({ user: filter.user, origenDatos: filter?.origenDatos, assessmentId: filter?.assessmentId, schoolId: filter?.schoolId });
  return await transformAssessmentsResponse(modelAssessments, performances, { user: filter?.user, schoolId: filter?.schoolId });
}

/**
 * Transforme the assessment list respond
 * @param {*} assessments list
 * @param {*} performances current map
 * @returns mapped assessment respond
 */
async function transformAssessmentsResponse(assessments, performances, user, schoolId) {
  let groupByAssessment = arrayGroupBy(assessments, "assessment");

  const competencias = await modelScore.getFortalezasOportunidades(user, schoolId);

  return Object.entries(groupByAssessment).map(
    ([key, value]) => {
      const global = value.length > 0 ? value.reduce((a, b) => a + b.score, 0) : 0;
      return {
        name: value[0]?.nombre_usuario,
        assessmentDate: value[0]?.date,
        assessmentId: value[0]?.assessmentId,
        assessmentName: value[0]?.assessment,
        globalScore: Math.round(global),
        performance: findPerformanceLevel(global, performances, true),
        areaScores: value.map((value) => {
          delete value.assessment; delete value.evaluacion; delete value.description; delete value.date; delete value.assessmentId;
          return {
            ...value,
            performance: findPerformanceLevel(value.score, performances),
            fortalezas: findFortOp(value.area, competencias, 75),
            oportunidades: findFortOp(value.area, competencias, 25),
            score: Math.round(value.score),
            ruta: {
              descripcion: 'Esta es la ruta de mejoramiento que diseñamos para ti donde encontrarás masterclasses, micro-contenidos de aprendizaje, contenidos interactivos y test de práctica. A medida que completes las actividades se habilitarán las siguientes',
              opciones: [
                {
                  nombre: 'M1',
                  color: ''
                },
                {
                  nombre: 'M3',
                  color: ''
                },
                {
                  nombre: 'M4',
                  color: ''
                },
                {
                  nombre: 'M6',
                  color: ''
                },
                {
                  nombre: 'M8',
                  color: ''
                }
              ]
            }
          }
        }),
      };
    }
  );
}

/**
 * Find the performance level for an score
 * @param {*} performance score to find
 * @param {*} performanceLevels 
 * @param {*} global is optional only is tru for score global 
 * @returns the performance level for some score
 */
function findPerformanceLevel(performance, performanceLevels, global = false) {

  if (global) {
    for (let p of performanceLevels) if (performance <= p.performance * 5) return p.level;
  }

  for (let p of performanceLevels) if (performance <= p.performance) return p.level;

  console.log(`Rendimiento ${performance} excede los valores permistidos que se almacenan en base de datos.`);
  return `Fuera de rango`;
}

function findFortOp(area, evidencias, puntaje) {
  const evidenciasUnicas = new Set();

  evidencias.forEach(evidencia => {
    if (evidencia.area === area && (puntaje >= 75 ? evidencia.puntuacion >= 75 : evidencia.puntuacion <= puntaje)) {
      evidenciasUnicas.add(evidencia.evidencia);
    }
  });

  return Array.from(evidenciasUnicas);
}

async function assessmentComparation(studentScores, userId, schoolId) {

  console.log('userId', userId)
  console.log('schoolId', schoolId)

  if (!userId || !schoolId) {
    console.error('UserId o schoolId no definido');
    throw Error('Dataos de usuario no definidos.');
  }
  const course = await modelScore.getCurrentCourse(userId, schoolId);
  return studentScores;
}

async function evaluaciones(filter) {
  return modelScore.getCompetenceScore({ user: filter?.user, schoolId: filter?.schoolId });
}
