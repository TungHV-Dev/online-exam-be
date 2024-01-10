const dashboardRepo = require('../repositories/dashboard.repo')
const constant = require('../utils/constant')
const { getLastSevenDay } = require('../utils/helper')

const getDashboardSummaryData = async () => {
    try {
        const overviewData = await dashboardRepo.getOverviewData()
        
        const nearestJoinedExamData = await dashboardRepo.getNearestJoinedExamNumber(6)
        const last7day = getLastSevenDay(constant.DATE_FORMAT.DD_MM_YYYY)

        const chartData = []
        last7day.map((date, index) => {
            if (nearestJoinedExamData[index]) {
                chartData.push({
                    label: nearestJoinedExamData[index].exam_date,
                    y: Number(nearestJoinedExamData[index].joined_exam_number)
                })
            } else {
                chartData.push({
                    label: date,
                    y: 0
                })
            }
        })

        const top5Class = await dashboardRepo.getTopClassHasMaxAvgScore(5)
        const result = {
            overview: overviewData,
            chart: chartData.reverse(),
            table: top5Class
        }
        return result
    } catch (error) {
        throw error
    }
}

module.exports = {
    getDashboardSummaryData
}