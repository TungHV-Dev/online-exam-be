const dashboardRepo = require('../repositories/dashboard.repo')

const getDashboardSummaryData = async () => {
    try {
        const overvieData = await dashboardRepo.getOverviewData()


        const result = {
            overview: overvieData
        }
        return result
    } catch (error) {
        throw error
    }
}

module.exports = {
    getDashboardSummaryData
}