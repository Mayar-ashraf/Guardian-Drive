import{object, z} from "zod"; 
export const getUserbyIDschema =z.object(
    { params:z.object({ 
        id:z.string().regex(/^\d+$/,"User ID must be a number"), 
    }).strict(), 
});