import{object, z} from "zod"; 

export const edituserbyIDschema =z.object({
    params:z.object({
        id:z.string().regex(/^\d+$/,"User ID must be a number"),
    }).strict(),
    body :z.object({
        email:z.string().email().optional(),
        fName:z.string().min(2).optional(),
        lName:z.string().min(2).optional(),
phone: z.array(
  z.string().min(10, "Phone number must be at least 10 digits")
).optional(),
        address:z.string().optional(),



    }).strict()
    .refine(
        (data)=>Object.keys(data).length>0,
        {message:"At least one field must be provided"},
    ),

});