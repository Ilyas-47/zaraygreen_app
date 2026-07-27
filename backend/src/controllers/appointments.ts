// src/controllers/appointments.ts
import { Response } from 'express';
import { appointmentService } from '../services/appointments.service';
import { ok, fail, paginate } from '../utils';
import { AuthRequest } from '../middlewares/auth';

export const appointmentController = {

  async create(req: AuthRequest, res: Response) {
    try {
      const appt = await appointmentService.create(req.user!.id, req.body);
      return ok(res, appt, 201);
    } catch (e: any) {
      return fail(res, e.message || "Erreur lors de la création");
    }
  },

  async getMy(req: AuthRequest, res: Response) {
    try {
      const appts = await appointmentService.getMyAppointments(req.user!.id);
      return ok(res, appts);
    } catch (e: any) {
      return fail(res, e.message);
    }
  },

  async getTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await appointmentService.getTasks(req.user!.id);
      return ok(res, tasks);
    } catch (e: any) {
      return fail(res, e.message);
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const { page = '1', limit = '20', status } = req.query;
      const result = await appointmentService.getAll(
        parseInt(page as string) || 1,
        parseInt(limit as string) || 20,
        status as string
      );
      return paginate(res, result.appointments, result.total, 
                     parseInt(page as string) || 1, 
                     parseInt(limit as string) || 20);
    } catch (e: any) {
      return fail(res, e.message);
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const appt = await appointmentService.getById(req.params.id as string);
      if (!appt) return fail(res, "Rendez-vous non trouvé", 404);
      return ok(res, appt);
    } catch (e: any) {
      return fail(res, e.message);
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status, technicianId, images, notes } = req.body;
      const appt = await appointmentService.updateStatus(req.params.id as string, status, technicianId, images, notes);
      return ok(res, appt);
    } catch (e: any) {
      return fail(res, e.message);
    }
  },
};