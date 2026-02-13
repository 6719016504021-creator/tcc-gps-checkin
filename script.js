import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// NOTE: Replace with your actual Firebase Config if running locally
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = window.__app_id || 'default-app';

// Global State (Synced with Firestore)
window.AppState = {
    students: [],
    attendance: [],
    leaves: [],
    settings: { logo: null, zone: null, lateTime: '', sheetUrl: '', webhookUrl: '' },
    user: null
};

// Database Path Helper
const DATA_PATH = `artifacts/${appId}/public/data`;

// 1. Robust Auth & Listeners
const initAuth = async () => {
    try {
        if (window.__initial_auth_token) {
            await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (e) {
        console.error("Auth failed:", e);
        if (!auth.currentUser) signInAnonymously(auth).catch(err => console.error("Fallback auth failed", err));
    }
};

initAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Connected to Cloud as:", user.uid);
        window.AppState.user = user;
        startListeners();
    }
});

let listenersStarted = false;
function startListeners() {
    if (listenersStarted) return;
    listenersStarted = true;

    onSnapshot(doc(db, DATA_PATH, 'config', 'main'), (docSnap) => {
        if (docSnap.exists()) {
            window.AppState.settings = { ...window.AppState.settings, ...docSnap.data() };
            window.dispatchEvent(new Event('settings-updated'));
        }
    }, (error) => console.log("Config listener warning:", error.code));

    onSnapshot(collection(db, DATA_PATH, 'students'), (snap) => {
        window.AppState.students = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        window.dispatchEvent(new Event('data-updated'));
    }, (error) => console.log("Students listener warning:", error.code));

    onSnapshot(collection(db, DATA_PATH, 'attendance'), (snap) => {
        window.AppState.attendance = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        window.dispatchEvent(new Event('data-updated'));
    });

    onSnapshot(collection(db, DATA_PATH, 'leaves'), (snap) => {
        window.AppState.leaves = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        window.dispatchEvent(new Event('data-updated'));
    });
}

// 2. Global Write Actions
window.CloudDB = {
    saveConfig: async (data) => {
        if (!auth.currentUser) return;
        await setDoc(doc(db, DATA_PATH, 'config', 'main'), data, { merge: true });
    },
    addStudent: async (student) => {
        if (!auth.currentUser) return;
        await setDoc(doc(db, DATA_PATH, 'students', student.student_id), student);
    },
    deleteStudent: async (studentId) => {
        if (!auth.currentUser) return;
        await deleteDoc(doc(db, DATA_PATH, 'students', studentId));
    },
    updateStudent: async (studentId, data) => {
        if (!auth.currentUser) return;
        await updateDoc(doc(db, DATA_PATH, 'students', studentId), data);
    },
    addAttendance: async (record) => {
        if (!auth.currentUser) return;
        const id = `${record.student_id}_${Date.now()}`;
        await setDoc(doc(db, DATA_PATH, 'attendance', id), record);
    },
    addLeave: async (record) => {
        if (!auth.currentUser) return;
        const id = `${record.student_id}_${Date.now()}`;
        await setDoc(doc(db, DATA_PATH, 'leaves', id), record);
    },
    updateLeave: async (docId, data) => {
        if (!auth.currentUser) return;
        await updateDoc(doc(db, DATA_PATH, 'leaves', docId), data);
    },
    clearAllData: async () => {
        if (!auth.currentUser) return;
        await setDoc(doc(db, DATA_PATH, 'config', 'main'), {});
    }
};
// ... (โค้ดเดิมด้านบน) ...

// Explicitly expose to window
window.studentApp = studentApp;
window.teacherApp = teacherApp;
window.mapSystem = mapSystem;
window.gpsSystem = gpsSystem;
window.router = router;

window.addEventListener('load', () => {
    // seedData(); // ปิดการสร้างข้อมูลตัวอย่าง
    const logo = localStorage.getItem('app_custom_logo');
    if(logo) document.getElementById('app-logo').src = logo;
    router.navigateTo('landing');
});

// ... (Rest of the application logic like teacherApp, studentApp, mapSystem goes here - copy from the single file script section) ...
// NOTE: For brevity, I'm providing the structure. You should copy the content inside the <script> tags from the previous single-file response into this file.
// Make sure to remove the <script> tags themselves when pasting into .js file.