const dataScore = require("./student_score_detail");

exports.student_score_detail_data = async (event) => {
    const data2 = await dataScore.handlerStudentScoreDetail(event)
    console.log(data2);
    const charts = ["chart-m", "chart-l", "chart-s", "chart-c", "chart-i"];
    const dpls = ["1", "4", "2", "3", "5"];

    // Función para asignar valores de charts a areaScores
    function asignarCharts(areaScores, charts, dpls) {
        areaScores.forEach((areaScore, i) => {
            if (i < charts.length) {
                areaScore.chart = charts[i];
                areaScore.dpls = dpls[i];
            }
        });
    }

    const primerAssessment = data2?.data?.assessments[0];
    asignarCharts(primerAssessment.areaScores, charts, dpls);

    let groups = data2?.data?.areaCompetences[0]?.areas?.map(a => {
        const series = [
            {
                name: 'Alumno',
                data: []
            }
        ]
        return {
            key: a?.nombre,
            series: series,
            value: a?.componente?.map(x => {
                for (const comp of x?.competencias) {
                    // Create competences
                    series[0]?.data?.push(
                        {
                            x: comp?.nombre,
                            y: comp?.puntuacion,
                            goals: [
                                {
                                    name: 'Curso',
                                    value: comp?.curso,
                                    strokeHeight: 5,
                                    strokeColor: '#3F55AA'
                                }
                            ]
                        })
                }
                return {
                    title: x?.nombre,
                    cols: x?.competencias?.length
                    // Create competence
                }
            })
        }
    })
    const defaultSeries = [
        {
            name: 'Alumno',
            data: []
        }
    ]
    groups = groups ?? [
        { key: 'Matemáticas', series: defaultSeries, value: [] },
        { key: 'Lectura crítica', series: defaultSeries, value: [] },
        { key: 'Sociales y ciudadanas', series: defaultSeries, value: [] },
        { key: 'Ciencias naturales', series: defaultSeries, value: [] },
        { key: 'Inglés', series: defaultSeries, value: [] }
    ]
    return {
        ...data2, groups: JSON.stringify(
            groups?.reduce((acc, curr) => (acc[curr?.key] = curr?.value, acc), {})
        ),
        series: JSON.stringify(
            groups?.reduce((acc, curr) => (acc[curr?.key] = curr?.series, acc), {})
        )
    }


}