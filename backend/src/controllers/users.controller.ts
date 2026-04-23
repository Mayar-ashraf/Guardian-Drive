import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";

export const getAllusers=async(req:express.Request,res:express.Response)=>{
try {
    const role= req.user?.role;
    if (role==Role.ADMIN){
        const users=await prisma.user.findMany();
       return  res.json(users);

    }
    if (role==Role.FLEET_MANAGER){
        const users= await prisma.user.findMany({
            where:{role:Role.DRIVER}
        });
       return  res.json(users);
    }
    if(role==Role.DRIVER){
        return res.status(403).json({message:"you are unauthorized to make this request "});
    }
} catch (error) {
    console.error(error);
    res.status(500).json({message:"Internal Server Error"});

}

}
export const getuserbyID =async(req:express.Request,res:express.Response)=>{
    try{
        const caller=req.user;
        const role=req.user?.role;
        const   ID=Number(req.params.id);
        if(role==Role.ADMIN){
            const user=await prisma.user.findUnique({
                where:{id:ID}
            });
            return res.json(user);
        }
        if(role==Role.FLEET_MANAGER){
            const user=await prisma.user.findUnique({
                where:{id:ID}
            });  
            if(user?.role==Role.DRIVER){
                return res.json(user);

            }
            else {
               return res.status(403).json({message:"you are unauthorized to make this request "});
            }
            }
        if(role==Role.DRIVER){
               const user=await prisma.user.findUnique({
                where:{id:ID}
            }); 
            if(user?.id==caller?.userId){
              return  res.json(user);
            }
            else {
               return res.status(403).json({message:"you are unauthorized to make this request "});
            }
           
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal Server Error"});
    }
}
export const edituserbyID=async(req:express.Request,res:express.Response)=>{
    try{
        const role=req.user?.role;
        if (role==Role.DRIVER||role==Role.FLEET_MANAGER){
            return res.status(403).json({message:"you are unauthorized to make this request "});
        }
        if (role==Role.ADMIN){
            const{email,fname,lname,phone,address}=req.body;
            const data :any={};
            if(email) data.email=email;
            if(fname) data.fname=fname;
            if(lname) data.lname=lname;
            if(phone) data.phone=phone;
            if(address) data.address=address;
            const updateduser=await prisma.user.update({
                where:{id:Number(req.params.id)},
                data
            })
            return res.json(updateduser);

        }


    }
    catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal Server Error"});
    }

}
export const deleteuserbyID=async(req:express.Request,res:express.Response)=>{
    const role=req.user?.role;
    try{
        if(role==Role.DRIVER||Role.FLEET_MANAGER){
            return res.status(403).json({message:"you are unauthorized to make this request "});
        }
        if(role==Role.ADMIN){
            await prisma.user.delete({
                where:{id:Number(req.params.id)}
            })
            return res.json({message:"user deleted successfully"}); 
        }
        }
    
    catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal Server Error"});
    }

}
