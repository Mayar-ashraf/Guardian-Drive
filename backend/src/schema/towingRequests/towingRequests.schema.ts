import { z } from "zod";

export const createTowingRequestSchema = z.object({
  body: z.object({
    tripId: z.number(),
    alertId: z.number(),
    towingCompany: z.string().min(2),
    status: z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
  }).strict(),

  query: z.object({}).strict(),
  params: z.object({}).strict(),
});

export const getTowingRequestsSchema = z.object({
  query: z.object({
    fleetManagerId: z.coerce.number().int().positive().optional(),
    car: z.string().optional(),
    fleetManagerId: z.string().optional(),
    towingCompany: z.string().optional(),
    status: z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
    requestTime: z.coerce.date().optional(),
    completionTime: z.coerce.date().optional(),
  }).strict(),

  body: z.undefined(),
  params: z.object({}).strict(),
});


export const getTowingRequestByIdSchema = z.object({
  params: z.object({
    towingRequestId: z.coerce.number(),
  }).strict(),

  body: z.undefined(),
  query: z.object({}).strict(),
});

export const updateTowingRequestSchema = z.object({
  params: z.object({
    towingRequestId: z.coerce.number(),
  }).strict(),

  body: z.object({
    towingCompany: z.string().optional(),
    status: z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
    completionTime: z.coerce.date().optional(),
  })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    })
    .strict(),

  query: z.object({}).strict(),
});


export const deleteTowingRequestSchema = z.object({
  params: z.object({
    towingRequestId: z.coerce.number(),
  }).strict(),

  body: z.object({}).strict(),
  query: z.object({}).strict(),
});