import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"; 
import { CanvasLayout, CanvasType, CanvasLayoutDetails } from "../types/canvas-sections";
const db = getFirestore();

export class CanvasTypeService {
    private collectionRef = collection(db, "canvasTypes");
    private layoutCollectionRef = collection(db, "canvasLayouts");

    async saveCanvasType(canvasType: CanvasType): Promise<void> {
        try {
            await addDoc(this.collectionRef, canvasType);
            console.log("CanvasType saved successfully");
        } catch (error) {
            console.error("Error saving canvasType: ", error);
        }
    }

    async getCanvasTypes(): Promise<Record<string, CanvasType>> {
        console.log("Getting canvas types")
        try {
            const querySnapshot = await getDocs(this.collectionRef);
            let canvasTypes = querySnapshot.docs.map(doc => doc.data());
            return canvasTypes.reduce((acc, canvasType) => {
                acc[canvasType.name] = canvasType;
                return acc;
            }, {} as Record<string, CanvasType>);

        } catch (error) {
            console.error("Error retrieving canvasTypes: ", error);
            return {};
        }
    }

    async getCanvasLayouts(): Promise<Record<string, CanvasLayoutDetails>> {
        console.log("Getting canvas layouts")
        try {
            const querySnapshot = await getDocs(this.layoutCollectionRef);
            let canvasLayouts = querySnapshot.docs.map(doc => doc.data());
            return canvasLayouts.reduce((acc, canvasLayout) => {
                acc[canvasLayout.name] = canvasLayout;
                return acc;
            }, {} as Record<string, CanvasLayoutDetails>);

        } catch (error) {
            //foreach canvas type in CANVAS_LAYOUTS add to firestore
            
            console.error("Error retrieving canvasLayouts: ", error);
            return {};
        }
    }

    async getLayoutsByType(sectionCount: number): Promise<CanvasLayoutDetails[]> {
        try {
            const q = query(
                this.layoutCollectionRef, 
                where("sectionCount", "==", sectionCount)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as CanvasLayoutDetails);
        } catch (error) {
            console.error("Error retrieving layouts by type: ", error);
            return [];
        }
    }

    async saveLayout(layout: CanvasLayoutDetails): Promise<void> {
        try {
            await addDoc(this.layoutCollectionRef, layout);
            console.log("Layout saved successfully");
        } catch (error) {
            console.error("Error saving layout: ", error);
        }
    }
}