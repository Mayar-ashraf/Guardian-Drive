import{object, z} from "zod";
export const getUserbyIDschema =z.object({
    params:z.object({
        id:z.string().regex(/^d+$/,"User ID must be a number"),
    }),
});

export const edituserbyIDschema =z.object({
    params:z.object({
        id:z.string().regex(/^d+$/,"User ID must be a number"),
    }),
    body :z.object({
        email:z.string().email().optional(),
        fName:z.string().min(2).optional(),
        lName:z.string().min(2).optional(),
        phone:z.string().min(10).optional(),
        address:z.string().optional(),



    }).refine(
        (data)=>Object.keys(data).length>0,
        {message:"At least one field must be provided"},
    ),

});

export const deleteUserbyIDschema=z.object ({
    params:z.object({
        id:z.string().regex(/^d+$/,"User ID must be a number"),
    }),
    body :z.object({
        newFleetManagerId:z.number().optional(),
        newdriverID:z.number().optional()
    }),
})