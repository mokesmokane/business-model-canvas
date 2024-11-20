import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore"; 
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
            let canvasTypes = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    defaultLayout: data.defaultLayout ? {
                        ...data.defaultLayout,
                        id: doc.id
                    } : undefined
                } as CanvasType;
            });
            console.log("canvasTypes", canvasTypes) 

            let canvasTypesRecord = canvasTypes.reduce((acc, canvasType) => {
                acc[canvasType.id] = canvasType;
                return acc;
            }, {} as Record<string, CanvasType>);
            console.log("canvasTypesRecord", canvasTypesRecord)
            return canvasTypesRecord;
        } catch (error) {
            console.error("Error retrieving canvasTypes: ", error);
            return {};
        }
    }

    async getCanvasLayouts(): Promise<Record<string, CanvasLayoutDetails>> {
        console.log("Getting canvas layouts")
        try {
            const querySnapshot = await getDocs(this.layoutCollectionRef);
            let canvasLayouts = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as CanvasLayoutDetails));
            return canvasLayouts.reduce((acc, canvasLayout) => {
                acc[canvasLayout.id] = canvasLayout;
                return acc;
            }, {} as Record<string, CanvasLayoutDetails>);
        } catch (error) {
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
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }) as CanvasLayoutDetails);
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

    async deleteCanvasType(typeId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.collectionRef, typeId));
            console.log("CanvasType deleted successfully");
        } catch (error) {
            console.error("Error deleting canvasType: ", error);
            throw error;
        }
    }

    async deleteCanvasLayout(layoutId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.layoutCollectionRef, layoutId));
            console.log("Layout deleted successfully");
        } catch (error) {
            console.error("Error deleting layout: ", error);
            throw error;
        }
    }

    async getCanvasType(id: string): Promise<CanvasType | null> {
        try {
            const docRef = doc(this.collectionRef, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    ...docSnap.data(),
                    id: docSnap.id
                } as CanvasType;
            }
            return null;
        } catch (error) {
            console.error("Error retrieving canvas type: ", error);
            throw error;
        }
    }

    async updateCanvasType(id: string, canvasType: CanvasType): Promise<void> {
        try {
            const { id: _, ...updateData } = canvasType;  // Remove id field from update data
            const docRef = doc(this.collectionRef, id);
            await updateDoc(docRef, updateData);
            console.log("CanvasType updated successfully");
        } catch (error) {
            console.error("Error updating canvas type: ", error);
            throw error;
        }
    }
}