import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, setDoc, serverTimestamp, DocumentData } from "firebase/firestore"; 
import { CanvasLayout, CanvasType, CanvasLayoutDetails } from "../types/canvas-sections";
import { db } from "../lib/firebase";

export class CanvasTypeService {
    private static instance: CanvasTypeService;
    private currentUserId: string | null = null;
    private collectionRef = collection(db, "canvasTypes");
    private layoutCollectionRef = collection(db, "canvasLayouts");

    private constructor() {}

    public static getInstance(): CanvasTypeService {
        if (!CanvasTypeService.instance) {
            CanvasTypeService.instance = new CanvasTypeService();
        }
        return CanvasTypeService.instance;
    }

    public initialize(userId: string) {
        this.currentUserId = userId;
    }

    public reset() {
        this.currentUserId = null;
    }

    private getUserId(): string {
        if (!this.currentUserId) {
            throw new Error('UserId not set. Call initialize first.');
        }
        return this.currentUserId;
    }

    async saveCanvasType(canvasType: CanvasType): Promise<void> {
        try {
            await addDoc(this.collectionRef, canvasType);
            console.log("CanvasType saved successfully");
        } catch (error) {
            console.error("Error saving canvasType: ", error);
        }
    }
    
    async saveUserCanvasType(canvasType: CanvasType): Promise<void> {
        try {
            const docRef = doc(collection(db, 'userCanvasTypes', this.getUserId(), 'canvasTypes'), canvasType.id);
            await setDoc(docRef, canvasType);
            console.log("CanvasType saved successfully");
        } catch (error) {
            console.error("Error saving canvasType: ", error);
        }
    }

    async getCanvasTypes(): Promise<Record<string, CanvasType>> {
        try {
            // Get standard types
            const standardTypes = await this.getStandardCanvasTypes();
            
            // If no userId, return only standard types
            if (!this.currentUserId) {
                return standardTypes;
            }

            // Get custom types
            const customTypes = await this.getCustomCanvasTypes();
            
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
        const querySnapshot = await getDocs(collection(db, "canvasTypes"));
        return querySnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { 
                ...doc.data(),
                defaultLayout: doc.data().defaultLayout ? {
                    ...doc.data().defaultLayout,
                } : undefined,
                id: doc.id
            } as CanvasType;
            return acc;
        }, {} as Record<string, CanvasType>);
    }

    async getCustomCanvasTypes(): Promise<Record<string, CanvasType>> {
        const userId = this.getUserId();
        const querySnapshot = await getDocs(collection(db, 'userCanvasTypes', userId, 'canvasTypes'));
        return querySnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { 
                ...doc.data(),
                isCustom: true,
                defaultLayout: doc.data().defaultLayout ? {
                    ...doc.data().defaultLayout,
                    id: doc.id
                } : undefined,
                id: doc.id
            } as CanvasType;
            return acc;
        }, {} as Record<string, CanvasType>);
    }

    async getCanvasLayouts(): Promise<Record<string, CanvasLayoutDetails>> {
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
        } catch (error) {
            console.error("Error saving layout: ", error);
        }
    }

    async deleteCanvasType(typeId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.collectionRef, typeId));
        } catch (error) {
            console.error("Error deleting canvasType: ", error);
            throw error;
        }
    }

    async deleteCanvasLayout(layoutId: string): Promise<void> {
        try {
            await deleteDoc(doc(this.layoutCollectionRef, layoutId));
        } catch (error) {
            console.error("Error deleting layout: ", error);
            throw error;
        }
    }

    async getCanvasType(typeId: string): Promise<CanvasType | null> {
        try {
            // First check standard types
            const standardDocRef = doc(db, "canvasTypes", typeId);
            const standardDocSnap = await getDoc(standardDocRef);

            if (standardDocSnap.exists()) {
                const canvasType = {...standardDocSnap.data(),  id: typeId } as CanvasType;
                console.log("canvasType", canvasType)
                return canvasType;
            }


            // If not found and userId provided, check custom types
            if (this.currentUserId) {
                const customDocRef = doc(collection(db, 'userCanvasTypes', this.currentUserId, 'canvasTypes'), typeId);
                const customDocSnap = await getDoc(customDocRef);
                
                if (customDocSnap.exists()) {
                    return { id: typeId, ...customDocSnap.data() } as CanvasType;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching canvas type:", error);
            return null;
        }
    }

    async getUser(): Promise<DocumentData | null> {
        if (!this.currentUserId) {
            return null;
        }
        const userDocRef = doc(db, 'users', this.currentUserId);

        // Check if user document exists
        const userDoc = await getDoc(userDocRef);
        return userDoc.data() || null;
    }

    async updateCanvasType(id: string, canvasType: CanvasType): Promise<void> {
        //must check if user is admin
        const user = await this.getUser();
        if (!user?.admin) {
            throw new Error('User is not admin');
        }
        try {
            const { id: _, ...updateData } = canvasType;  // Remove id field from update data
            const docRef = doc(this.collectionRef, id);
            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Error updating canvas type: ", error);
            throw error;
        }
    }

    async saveCustomCanvasType(id: string, canvasType: CanvasType): Promise<void> {
        const userId = this.getUserId();
        try {
            const canvasRef = doc(collection(db, 'userCanvasTypes', userId, 'canvasTypes'), id);
            await setDoc(canvasRef, canvasType);
        } catch (error) {
            console.error("Error saving custom canvas type: ", error);
            throw error;
        }
    }

    async updateCanvasLayout(id: string, layout: CanvasLayoutDetails): Promise<void> {
        try {
            const { id: _, ...updateData } = layout;  // Remove id field from update data
            const docRef = doc(this.layoutCollectionRef, id);
            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Error updating canvas layout: ", error);
            throw error;
        }
    }

    async updateCustomCanvasType(canvasType: CanvasType): Promise<void> {
        if (!canvasType.id) throw new Error('Canvas type ID is required');
        
        const userId = this.getUserId();
        const canvasTypeRef = doc(collection(db, 'userCanvasTypes', userId, 'canvasTypes'), canvasType.id);
        
        await setDoc(canvasTypeRef, {
            ...canvasType,
            updatedAt: serverTimestamp(),
        });
    }
}

// Export singleton instance
export const canvasTypeService = CanvasTypeService.getInstance();