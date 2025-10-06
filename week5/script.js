// --- CONSTANTS ---
const LOCAL_STORAGE_KEY = 'project_web_data';
const EXPIRATION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// --- ELEMENTS ---
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const currentThemeSpan = document.getElementById('current-theme');
const userForm = document.getElementById('user-form');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const formMessage = document.getElementById('form-message');
const clearDataButton = document.getElementById('clear-data-button');
const optInDataCheckbox = document.getElementById('opt-in-data');
const dataSaveStatus = document.getElementById('data-save-status');

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

// --- AUTH/DATA CHECK ---
let isDataSavingEnabled = true;

/**
 * Clears all local storage data associated with this app key.
 * Updates UI elements and displays a confirmation message (not alert).
 */
function clearLocalData(showConfirmation = true) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    // Clear form inputs
    userNameInput.value = '';
    userEmailInput.value = '';
    
    // Reset theme (optional, but ensures a clean slate)
    setTheme('light');

    if (showConfirmation) {
        formMessage.textContent = 'All stored data cleared successfully!';
        formMessage.classList.remove('text-green-700');
        formMessage.classList.add('text-red-700', 'dark:text-red-400');
        setTimeout(() => { formMessage.textContent = ''; }, 3000);
    }
    updateDataStatus('No data stored');
}

/**
 * Checks the stored timestamp and cleans up data if it has expired.
 */
function checkAndCleanupData() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) return;

    try {
        const data = JSON.parse(storedData);
        const expiryTime = data.timestamp + (EXPIRATION_DAYS * MS_PER_DAY);
        
        if (Date.now() > expiryTime) {
            console.warn(`Data expired (${EXPIRATION_DAYS} days). Cleaning up.`);
            clearLocalData(false); // Clear silently
            updateDataStatus('Data expired and cleaned up.');
        } else {
            const daysLeft = Math.ceil((expiryTime - Date.now()) / MS_PER_DAY);
            updateDataStatus(`Data active. Expires in ~${daysLeft} days.`);
        }
    } catch (e) {
        console.error("Error parsing stored data. Clearing invalid storage.", e);
        clearLocalData(false);
    }
}

/**
 * Loads data from localStorage and initializes the application state.
 */
function loadData() {
    checkAndCleanupData(); // First, check for expiration

    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) {
        setTheme('light');
        updateDataStatus('No data stored');
        return;
    }

    try {
        const data = JSON.parse(storedData);
        
        // Load Theme
        setTheme(data.preferences?.theme || 'light', false);

        // Load Form Data
        if (data.formData) {
            userNameInput.value = data.formData.name || '';
            userEmailInput.value = data.formData.email || '';
            updateDataStatus('Data loaded from previous session.');
        }

        // Load Opt-In Status
        isDataSavingEnabled = data.preferences?.optIn ?? true;
        optInDataCheckbox.checked = isDataSavingEnabled;

    } catch (e) {
        console.error("Could not load or parse data.", e);
        clearLocalData(false);
    }
}

/**
 * Saves current application state (theme and form data) to localStorage.
 */
function saveData() {
    if (!isDataSavingEnabled) {
        console.log("Data saving is disabled by user opt-out.");
        updateDataStatus('Data saving is currently disabled.');
        return;
    }

    const dataToSave = {
        timestamp: Date.now(),
        preferences: {
            // NOTE: Use 'dark' class name to match new CSS
            theme: body.classList.contains('dark') ? 'dark' : 'light', 
            optIn: isDataSavingEnabled
        },
        formData: {
            name: userNameInput.value,
            email: userEmailInput.value,
        }
    };
    
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        updateDataStatus('Data saved successfully.');
        console.log("Data saved with new timestamp.");
    } catch (e) {
        console.error("Could not save data to localStorage.", e);
        updateDataStatus('Error saving data.');
    }
}

/**
 * Sets the application theme and updates the UI button text.
 */
function setTheme(mode, shouldSave = true) {
    if (mode === 'dark') {
        body.classList.add('dark'); // Renamed class to 'dark'
        currentThemeSpan.textContent = 'Dark';
    } else {
        body.classList.remove('dark'); // Renamed class to 'dark'
        currentThemeSpan.textContent = 'Light';
    }
    if (shouldSave) {
        saveData();
    }
}

/**
 * Updates the status text for data persistence.
 */
function updateDataStatus(message) {
    dataSaveStatus.textContent = message;
}


// --- EVENT LISTENERS (Ensuring interactive elements work across device types) ---

// 1. Theme Toggle (User Preference Persistence)
themeToggle.addEventListener('click', () => {
    const isDark = body.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
});

// 2. Form Submission (Form Data Persistence)
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveData();
    formMessage.textContent = 'Form data saved locally!';
    formMessage.classList.remove('text-red-700');
    formMessage.classList.add('text-green-700', 'dark:text-green-400');
    setTimeout(() => { formMessage.textContent = ''; }, 3000);
});

// 3. Clear Data Button (User Control)
clearDataButton.addEventListener('click', () => {
    // Confirmation via custom message, not alert()
    const confirmAction = window.confirm("Are you sure you want to clear ALL locally stored data?");
    if (confirmAction) {
        clearLocalData();
        optInDataCheckbox.checked = true; // Reset opt-in to default
        isDataSavingEnabled = true;
    }
});

// 4. Opt-Out Checkbox (User Control)
optInDataCheckbox.addEventListener('change', (e) => {
    isDataSavingEnabled = e.target.checked;
    if (!isDataSavingEnabled) {
        // If the user opts out, clear the data immediately
        clearLocalData(false);
        updateDataStatus('Data saving is DISABLED and storage was cleared.');
    } else {
        updateDataStatus('Data saving is ENABLED.');
    }
});

// 5. Responsive Navigation Toggle (Touch/Click interaction)
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    // Close the menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
        });
    });
});

// --- INITIALIZATION ---
window.onload = loadData;

// Save data whenever a form field is changed (debounce in a real app)
userNameInput.addEventListener('input', saveData);
userEmailInput.addEventListener('input', saveData);
