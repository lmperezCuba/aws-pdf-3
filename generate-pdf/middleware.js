const student_score_detail_data = require('./student_score_detail/student_score_detail_transform')

exports.loadData = (event) => {
        try {
        switch (event?.report) {
            case 'student_score_detail':
                return student_score_detail_data.student_score_detail_data(event)
            default:
                console.error(`No existe el reporte ${event.report}.`);
                throw Error(`No existe el reporte ${event.report}.`)
        }

    } catch (error) {
        console.error(error);
        throw Error('Ha ocurrido un error al cargar el report student_score_detail.')
    }
}

