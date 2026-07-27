// src/services/dashboard.service.ts
import { prisma } from '../utils/prisma'

export const dashboardService = {
  async getStats() {
    // 1. Total Orders count
    const totalOrders = await prisma.order.count()

    // 2. Active Projects / Appointments (not COMPLETED or CANCELLED)
    const activeAppointments = await prisma.appointment.count({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    })

    // 3. Monthly Revenue (validated orders in the current month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      },
      select: {
        totalAmount: true
      }
    })

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate growth/change indicator (mock or calculated)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const lastMonthOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    })

    let ordersChange = '+0%'
    if (lastMonthOrdersCount > 0) {
      const growth = ((totalOrders - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
      ordersChange = `${growth >= 0 ? '+' : ''}${Math.round(growth)}%`
    } else if (totalOrders > 0) {
      ordersChange = `+100%`
    }

    return {
      totalOrders: {
        value: totalOrders.toLocaleString(),
        change: ordersChange
      },
      activeProjects: {
        value: activeAppointments.toString(),
        change: '+ new'
      },
      monthlyRevenue: {
        value: `${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD`,
        target: 'Objectif: 50 000 MAD'
      }
    }
  }
}
