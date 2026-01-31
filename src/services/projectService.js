import { 
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from '../firebaseConfig';

const PROJECTS_COLLECTION = 'projects';

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      bugCount: 0,
    });
    return { id: docRef.id, ...projectData };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Get all projects for a user
 */
export const getProjects = async (userId) => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('owner', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

/**
 * Get a single project by ID
 */
export const getProjectById = async (projectId) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDocs(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

/**
 * Subscribe to projects for real-time updates
 */
export const subscribeToProjects = (userId, callback) => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('owner', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(projects);
    }, (error) => {
      console.error('Error in subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to projects:', error);
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (projectId, updateData) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
    return { id: projectId, ...updateData };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
    return projectId;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Update project bug count
 */
export const updateProjectBugCount = async (projectId, count) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      bugCount: count,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating project bug count:', error);
    throw error;
  }
};

/**
 * Search projects by name
 */
export const searchProjects = (projects, searchTerm) => {
  if (!searchTerm.trim()) return projects;
  return projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export default {
  createProject,
  getProjects,
  getProjectById,
  subscribeToProjects,
  updateProject,
  deleteProject,
  updateProjectBugCount,
  searchProjects
};
