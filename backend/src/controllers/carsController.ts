import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
async function updateCar(req: Request, res: Response) {

    try {
        const engineId = req.validated?.params.engineId
        const updates = req.validated?.body
        const car = await prisma.car.update({
            where: { engineId: engineId },
            data: updates
        })
        return res.status(200).json({ car });

    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Car not found" });
        }
        return res.status(500).json({ message: "Server Error" })
    }
}
async function deleteCar(req: Request, res: Response) {
    try {
        const engineId = req.validated?.params.engineId
        await prisma.car.delete({
            where: {
                engineId: engineId
            }
        })
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Car not found" });
        }
        return res.status(500).json({ message: "Server Error" })
    }

}
export { updateCar, deleteCar }