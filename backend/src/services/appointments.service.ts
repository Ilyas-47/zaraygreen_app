// src/services/appointments.service.ts
import { prisma } from '../utils/prisma'

export const appointmentService = {

  async create(userId: string, data: {
    serviceId: string; address: string;
    scheduledAt?: string; notes?: string;
    locationLat?: number; locationLng?: number;
  }) {
    return prisma.appointment.create({
      data: {
        userId,
        serviceId:   data.serviceId,
        address:     data.address,
        notes:       data.notes,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { service: true, user: { select: { id: true, name: true, phone: true } } },
    })
  },

  async getMyAppointments(userId: string) {
    return prisma.appointment.findMany({
      where:   { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getTasks(technicianId: string) {
    return prisma.appointment.findMany({
      where:   { technicianId },
      include: { 
        service: true,
        user: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { scheduledAt: 'asc' },
    })
  },

  async getAll(page = 1, limit = 20, status?: string) {
    const where: any = {}
    if (status) where.status = status

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          user:       { select: { id: true, name: true, email: true, phone: true } },
          technician: { select: { id: true, name: true, email: true, phone: true } },
          service:    true,
        },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.appointment.count({ where }),
    ])
    return { appointments, total }
  },

  async getById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        user:       { select: { id: true, name: true, email: true, phone: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        service:    true,
      },
    })
  },

  async updateStatus(appointmentId: string, status?: string, technicianId?: string, images?: string[], notes?: string) {
    const data: any = {};
    if (status) data.status = status;
    if (technicianId !== undefined) data.technicianId = technicianId === '' ? null : technicianId;
    if (images) data.images = JSON.stringify(images);
    if (notes !== undefined) data.notes = notes;

    return prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: {
        user:       { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, name: true, phone: true } },
        service:    true,
      },
    })
  },
}