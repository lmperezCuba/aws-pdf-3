const { improve } = require("@teamPleno/dbConnection");

exports.findGlobalScoreByStudent = async ({ user, origenDatos,assessmentId,schoolId }) => {
  try {
    const result = await findAreaScore({ user, origenDatos,assessmentId,schoolId });
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Find the current year area scores by evaluation for a defined student.
 */
async function findAreaScore({ user, origenDatos = 1, assessmentId, schoolId }) {
  try {
    const result = await improve.avg('c.puntuacion as score') // .avg( 'co.id as colegio')
      .select(
       'us.nombre_usuario',
       'a.area ',
       'ev.id as assessmentId',
       'ev.nombre as assessment',
       'ev.descripcion as description',
       'c.evaluacion',
       'ev.date_added as date'
        )
      .from('calificacion as c')
      .innerJoin('evaluacion as ev', 'ev.id', '=', 'c.evaluacion')
      .innerJoin('bloque as b', 'b.id', '=', 'c.bloque')
      .innerJoin('indicador_secundario as is', 'is.id', '=', 'b.indicador_secundario')
      .innerJoin('area as a', 'a.id', '=', 'is.area')
      .innerJoin('planificacion_bloque as pb', 'pb.bloque', '=', 'b.id')
      .innerJoin('planificacion as p', 'p.id', '=', 'pb.planificacion')
      .innerJoin('nivel as n', 'n.id', '=', 'p.nivel')
      .innerJoin('colegio as co', 'co.id', '=', 'p.colegio')
      .innerJoin('usuario as us', 'c.usuario', '=', 'us.id')
      .where('c.usuario', user)
      // .andWhere('n.id', user?.levelCourse[0]?.id)
      .andWhere('co.id', schoolId)
      .andWhere('c.origen_datos', origenDatos)
      .andWhere('ev.id',assessmentId)
      .groupBy('is.area', 'assessmentId');
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Find the current year area scores by evaluation for a defined student.
 */
exports.findPerformanceLevel = async () => {
  return await improve.select('pl.puntaje_hasta as performance', 'pl.nombre as level', 'pl.descripcion as description')
    .from('nivel_desempeno as pl')
    .orderBy('performance', 'asc')
}

exports.getCurrentCourse = async (user, schoolId) => {
  // console.log(`${userId} - ${schoolId}`);
  try {
    const rs = await improve('curso')
      .select(['curso.id', 'nivel.id as levelId', 'nivel.nombre as name', 'segmento.id as segmentId', 'segmento.nombre as segment'])
      .join('usuario_curso', 'usuario_curso.curso', 'curso.id')
      .join('nivel', 'nivel.id', 'curso.nivel')
      .join('segmento', 'segmento.id', 'nivel.segmento')
      .where('usuario_curso.usuario', user)
      .where('colegio', schoolId)

    return rs
  } catch (error) {
    throw error
  }
}


exports.getFortalezasOportunidades = async ({user,schoolId}) => {
  try {
    const fortOp = await 
    improve
  .select(
    'evidencia.evidencia as evidencia',
    'area.area as area',
  )
  .select(improve.raw('AVG(alternativa.puntaje) * 100 as puntuacion'))
  .from('componente')
  .innerJoin('indicador_secundario', 'componente.indicador_secundario', 'indicador_secundario.id')
  .innerJoin('area', 'indicador_secundario.area', 'area.id')
  .innerJoin('bloque', 'bloque.indicador_secundario', 'indicador_secundario.id')
  .innerJoin('competencia', 'competencia.bloque', 'bloque.id')
  .innerJoin('item', 'item.bloque', 'bloque.id')
  .innerJoin('alternativa', 'alternativa.item', 'item.id')
  .innerJoin('alternativa_contestada', 'alternativa_contestada.alternativa', 'alternativa.id')
  .innerJoin('planificacion_contestada', 'alternativa_contestada.planificacion_contestada', 'planificacion_contestada.id')
  .innerJoin('planificacion', 'planificacion_contestada.planificacion', 'planificacion.id')
  .innerJoin('colegio', 'planificacion.colegio', 'colegio.id')
  .innerJoin('evaluacion', 'bloque.evaluacion', 'evaluacion.id')
  .innerJoin('evidencia', 'item.evidencia', 'evidencia.id')
  .innerJoin('afirmacion', 'evidencia.afirmacion', 'afirmacion.id')
  .where('planificacion_contestada.usuario', user)
  .andWhere('colegio.id', schoolId)
  .groupBy(
    'evaluacion.id',
    'planificacion_contestada.usuario',
    'area.area',
    'componente.nombre',
    'competencia.nombre',
    'evidencia.evidencia'
  ) 
    return fortOp
  } catch (error) {
    throw error
  }
}


exports.getCompetenceScore = async ({ user,schoolId }) => {
  try {
    const rs = await 
    improve
    .select([
      'colegio.id',
      'planificacion_contestada.usuario as usuarioId',
      'area.area as area',
      'componente.nombre as componente',
      'competencia.nombre as competencia',
      improve.raw('ROUND((SUM(alternativa.puntaje) / COUNT(alternativa.id)) * 100, 4) as puntuacion'),
      improve.raw('(SELECT AVG(puntuacion) FROM (SELECT ROUND((SUM(a.puntaje) / COUNT(a.id)) * 100, 4) AS puntuacion FROM componente JOIN indicador_secundario ON componente.indicador_secundario = indicador_secundario.id JOIN area ON indicador_secundario.area = area.id JOIN bloque ON bloque.indicador_secundario = indicador_secundario.id JOIN competencia ON competencia.bloque = bloque.id JOIN item ON item.bloque = bloque.id JOIN alternativa AS a ON a.item = item.id JOIN alternativa_contestada ON alternativa_contestada.alternativa = a.id JOIN planificacion_contestada ON alternativa_contestada.planificacion_contestada = planificacion_contestada.id JOIN planificacion ON planificacion_contestada.planificacion = planificacion.id JOIN colegio ON planificacion.colegio = colegio.id JOIN evaluacion ON bloque.evaluacion = evaluacion.id WHERE planificacion_contestada.usuario = 3307 AND colegio.id = 32 GROUP BY colegio.id) AS subquery) as curso'),
    ])
    .from('componente')
    .join('indicador_secundario', 'componente.indicador_secundario', 'indicador_secundario.id')
    .join('area', 'indicador_secundario.area', 'area.id')
    .join('bloque', 'bloque.indicador_secundario', 'indicador_secundario.id')
    .join('competencia', 'competencia.bloque', 'bloque.id')
    .join('item', 'item.bloque', 'bloque.id')
    .join('alternativa', 'alternativa.item', 'item.id')
    .join('alternativa_contestada', 'alternativa_contestada.alternativa', 'alternativa.id')
    .join('planificacion_contestada', 'alternativa_contestada.planificacion_contestada', 'planificacion_contestada.id')
    .join('planificacion', 'planificacion_contestada.planificacion', 'planificacion.id')
    .join('colegio', 'planificacion.colegio', 'colegio.id')
    .join('evaluacion', 'bloque.evaluacion', 'evaluacion.id')
    .where('planificacion_contestada.usuario', user)
    .andWhere('colegio.id', schoolId)
    .groupBy([
      'colegio.id',
      'planificacion_contestada.usuario',
      'area.area',
      'componente.nombre',
      'competencia.nombre',
    ]);

    return rs
  } catch (error) {
    throw error
  }
}

exports.getScoreItems = async ({user,schoolId,origenDatos,assessmentId,colegioDemo}) => {

  try {
    const result  = await improve('bloque as bl')
    .select([
      'ind_s.nombre as area',
      'it.id as item_id',
      'alt.puntaje as puntaje',
    ])
    .join('indicador_secundario as ind_s', 'bl.indicador_secundario', 'ind_s.id')
    .join('item as it', 'bl.id', 'it.bloque')
    .join('alternativa as alt', 'it.id', 'alt.item')
    .join('alternativa_contestada as ac', 'ac.alternativa', 'alt.id')
    .join('planificacion_contestada as pc', 'pc.id', 'ac.planificacion_contestada')
    .join('usuario_curso as uc', 'uc.usuario', 'pc.usuario')
    .join('curso', 'curso.id', 'uc.curso')
    .join('colegio', 'curso.colegio', 'colegio.id')
    .join('planificacion as p', 'p.id', 'pc.planificacion')
    .join('calificacion', 'calificacion.bloque', 'bl.id')
    .where({
      'pc.usuario': user,
      'colegio.id': schoolId,
      'calificacion.origen_datos': origenDatos,
      'bl.evaluacion': assessmentId,
      'colegio.demo': colegioDemo,
      'p.nivel': improve.raw('curso.nivel'),
    })
    .groupBy('ind_s.nombre', 'it.id');

    return result
  } catch (error) {
    throw error
  }
}