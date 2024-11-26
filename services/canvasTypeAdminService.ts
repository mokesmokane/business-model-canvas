import { getFirestore } from 'firebase-admin/firestore';
import { CanvasLayout, CanvasType, CanvasLayoutDetails } from "../types/canvas-sections";
// import { db } from '@/lib/firebase-admin';

export class CanvasTypeAdminService {
    // private collectionRef = db.collection("canvasTypes");
    // private layoutCollectionRef = db.collection("canvasLayouts");

    async saveCanvasType(canvasType: CanvasType): Promise<void> {
        // try {
        //     await this.collectionRef.add(canvasType);
        //     console.log("CanvasType saved successfully");
        // } catch (error) {
        //     console.error("Error saving canvasType: ", error);
        // }
    }

    async getCanvasTypes(userId?: string): Promise<Record<string, CanvasType>> {
        try {
            // Get standard types
            const standardTypes = await this.getStandardCanvasTypes();
            
            // If no userId, return only standard types
            if (!userId) {
                return standardTypes;
            }

            // Get custom types
            const customTypes = await this.getCustomCanvasTypes(userId);
            
            // Merge both collections, with custom types overriding standard ones if same ID
            return {
                ...standardTypes,
                ...customTypes
            };
        } catch (error) {
            console.error("Error fetching canvas types:", error);
            return {};
        }
    }

    async getStandardCanvasTypes(): Promise<Record<string, CanvasType>> {
        // const snapshot = await this.collectionRef.get();
        // return snapshot.docs.reduce((acc, doc) => {
        //     acc[doc.id] = { 
        //         ...doc.data(),
        //         defaultLayout: doc.data().defaultLayout ? {
        //             ...doc.data().defaultLayout,
        //         } : undefined,
        //         id: doc.id
        //     } as CanvasType;
        //     return acc;
        // }, {} as Record<string, CanvasType>);
        return {};
    }

    async getCustomCanvasTypes(userId: string): Promise<Record<string, CanvasType>> {
        // const snapshot = await db.collection('userCanvasTypes')
        //     .doc(userId)
        //     .collection('canvasTypes')
        //     .get();

        // return snapshot.docs.reduce((acc, doc) => {
        //     acc[doc.id] = { 
        //         ...doc.data(),
        //         defaultLayout: doc.data().defaultLayout ? {
        //             ...doc.data().defaultLayout,
        //             id: doc.id
        //         } : undefined,
        //         id: doc.id
        //     } as CanvasType;
        //     return acc;
        // }, {} as Record<string, CanvasType>);
        return {};
    }

    async getCanvasLayouts(): Promise<Record<string, CanvasLayoutDetails>> {
        // try {
        //     const snapshot = await this.layoutCollectionRef.get();
        //     let canvasLayouts = snapshot.docs.map(doc => ({
        //         ...doc.data(),
        //         id: doc.id
        //     } as CanvasLayoutDetails));
        //     return canvasLayouts.reduce((acc, canvasLayout) => {
        //         acc[canvasLayout.id] = canvasLayout;
        //         return acc;
        //     }, {} as Record<string, CanvasLayoutDetails>);
        // } catch (error) {
        //     console.error("Error retrieving canvasLayouts: ", error);
        //     return {};
        // }
        return {};
    }

    async getLayoutsByType(sectionCount: number): Promise<CanvasLayoutDetails[]> {
        // try {
        //     const snapshot = await this.layoutCollectionRef
        //         .where("sectionCount", "==", sectionCount)
        //         .get();
            
        //     return snapshot.docs.map(doc => ({
        //         ...doc.data(),
        //         id: doc.id
        //     }) as CanvasLayoutDetails);
        // } catch (error) {
        //     console.error("Error retrieving layouts by type: ", error);
        //     return [];
        // }
        return [];
    }

    async saveLayout(layout: CanvasLayoutDetails): Promise<void> {
        // try {
        //     await this.layoutCollectionRef.add(layout);
        // } catch (error) {
        //     console.error("Error saving layout: ", error);
        // }

    }

    async deleteCanvasType(typeId: string): Promise<void> {
        // try {
        //     await this.collectionRef.doc(typeId).delete();
        // } catch (error) {
        //     console.error("Error deleting canvasType: ", error);
        //     throw error;
        // }
    }

    async deleteCanvasLayout(layoutId: string): Promise<void> {
        // try {
        //     await this.layoutCollectionRef.doc(layoutId).delete();
        // } catch (error) {
        //     console.error("Error deleting layout: ", error);
        //     throw error;
        // }
    }

    async getCanvasType(typeId: string, userId?: string): Promise<CanvasType | null> {
        // try {
        //     // First check standard types
        //     const standardDoc = await this.collectionRef.doc(typeId).get();

        //     if (standardDoc.exists) {
        //         const canvasType = {...standardDoc.data(), id: typeId } as CanvasType;
        //         return canvasType;
        //     }

        //     // If not found and userId provided, check custom types
        //     if (userId) {
        //         const customDoc = await db
        //             .collection('userCanvasTypes')
        //             .doc(userId)
        //             .collection('canvasTypes')
        //             .doc(typeId)
        //             .get();
                
        //         if (customDoc.exists) {
        //             return { id: typeId, ...customDoc.data() } as CanvasType;
        //         }
        //     }

        //     return null;
        // } catch (error) {
        //     console.error("Error fetching canvas type:", error);
        //     return null;
        // }
        return null;
    }

    async updateCanvasType(id: string, canvasType: CanvasType): Promise<void> {
        // try {
        //     const { id: _, ...updateData } = canvasType;
        //     await this.collectionRef.doc(id).update(updateData);
        // } catch (error) {
        //     console.error("Error updating canvas type: ", error);
        //     throw error;
        // }
    }

    async saveCustomCanvasType(id: string, canvasType: CanvasType, userId: string): Promise<void> {
        // try {
        //     await db
        //         .collection('userCanvasTypes')
        //         .doc(userId)
        //         .collection('canvasTypes')
        //         .doc(id)
        //         .set(canvasType);
        // } catch (error) {
        //     console.error("Error saving custom canvas type: ", error);
        //     throw error;
        // }
    }

    async updateCanvasLayout(id: string, layout: CanvasLayoutDetails): Promise<void> {
        // try {
        //     const { id: _, ...updateData } = layout;
        //     await this.layoutCollectionRef.doc(id).update(updateData);
        // } catch (error) {
        //     console.error("Error updating canvas layout: ", error);
        //     throw error;
        // }
    }
} 