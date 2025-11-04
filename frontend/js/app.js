// Database variables - will be loaded from JSON files
let services = [];
let users = [];
let isAdmin = false;
// Cargar usuarios desde JSON
    const usersPromise = fetch('db/users.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON de usuarios');
            }
            return response.json();
        })
        .then(data => {
            console.log('%% Usuarios cargados desde JSON:', data);
            return data;
        })
        .catch(error => {
            console.error('X Error cargando usuarios desde JSON:', error);
            return { users: [] }; // Retornar objeto con array vacío
        });

// Load data from JSON files
async function loadDatabase() {
    try {
        // For now, since we don't have external files, load default data immediately
        loadDefaultData();
        //console.log('✅ Datos cargados exitosamente');
        //console.log(`📊 ${services.length} servicios cargados`);
        //console.log(`👥 ${users.length} usuarios cargados`);

        // Load services after data is ready
        loadServices();

    } catch (error) {
        //console.error('❌ Error cargando datos:', error);
        loadDefaultData();
        loadServices();
    }
}

// Fallback default data (same as before)
// Cargar datos desde db.json (usuarios y servicios)
async function loadDefaultData() {
    try {
        // 1️⃣ Intentar leer el archivo db.json
        const response = await fetch('db/db.json');
        if (!response.ok) {
            throw new Error('Error al cargar el archivo db.json');
        }

        // 2️⃣ Convertir respuesta a JSON
        const data = await response.json();
        console.log('✅ Datos cargados desde db.json:', data);

        // 3️⃣ Asignar los valores globales
        services = data.services || [];
        users = data.users || [];

        console.log(`📦 ${services.length} servicios cargados`);
        console.log(`👤 ${users.length} usuarios cargados`);

        // 4️⃣ Renderizar los servicios en la interfaz
        loadServices();

    } catch (error) {
        console.error('❌ Error cargando db.json:', error);

        // Si hay un error, inicializar con arrays vacíos (para evitar fallos)
        services = [];
        users = [];
        loadServices();
    }
}


let isLoggedIn = false;
let editingServiceId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎬 Iniciando aplicación TechSolutions Pro...');
    loadDatabase(); // Load JSON data first
    setupEventListeners();
    console.log('🎉 Aplicación inicializada correctamente');
});

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Login form listener agregado');
    } else {
        console.error('❌ No se encontró el formulario de login');
    }

    // Service form
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmit);
        console.log('✅ Service form listener agregado');
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        console.log('✅ Contact form listener agregado');
    }

    // Quote form
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
        console.log('✅ Quote form listener agregado');
    }

    // Modal close button - usando delegación de eventos
    document.addEventListener('click', function (event) {
        // Close button del modal
        if (event.target.classList.contains('close')) {
            console.log('🖱️ Click en botón cerrar modal');
            closeModal();
        }

        // Click fuera del modal
        if (event.target.id === 'serviceModal') {
            console.log('🖱️ Click fuera del modal');
            closeModal();
        }
    });

    console.log('✅ Event listeners de modal configurados');
}

function showSection(section) {
    console.log(`🔄 Cambiando a sección: ${section}`);

    // Hide all sections
    const sections = {
        'home-section': 'none',
        'services-section': 'none',
        'contact-section': 'none',
        'quote-section': 'none',
        'admin-panel': 'none'
    };

    // Hide login section differently
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
        loginSection.classList.add('hidden');
    }

    // Hide all other sections
    Object.keys(sections).forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Show requested section
    let targetElement = null;
    if (section === 'home') {
        targetElement = document.getElementById('home-section');
    } else if (section === 'services') {
        targetElement = document.getElementById('services-section');
    } else if (section === 'contact') {
        targetElement = document.getElementById('contact-section');
    } else if (section === 'quote') {
        targetElement = document.getElementById('quote-section');
    }

    if (targetElement) {
        targetElement.style.display = 'block';
        console.log(`✅ Sección ${section} mostrada correctamente`);
    } else {
        console.error(`❌ No se encontró la sección: ${section}`);
    }
}

function showLogin() {
    if (!!isAdmin) {
        showAdminPanel();
        return;
    }
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('services-section').style.display = 'none';
    document.getElementById('contact-section').style.display = 'none';
    document.getElementById('quote-section').style.display = 'none';
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-panel').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Intento de login detectado');

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (!usernameInput || !passwordInput) {
        console.error('❌ No se encontraron los campos de login');
        alert('Error: No se pudieron encontrar los campos de usuario y contraseña');
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log(`👤 Usuario ingresado: "${username}"`);
    console.log(`🔑 Contraseña ingresada: "${password}"`); 
    
    verificarCredenciales(username, password);
}
    // Verificación de credenciales
    function verificarCredenciales(username, password) {
        usersPromise.then(userData => {
            const user = userData.users.find(u => u.username === username && u.password === password);
            
            if (user) {
                console.log('%% Credenciales correctas');
                loginAgain = true;
                document.getElementById('loginForm').reset();
                
                if (user.role === 'administrator') {
                    showAdminPanel(); 
                    isAdmin = true;
                    document.getElementById('btnadmin').textContent = 'Admin';
                    console.log('%% Redirigido al panel de admin');
                } else {
                    isAdmin = false;
                    document.getElementById('btnadmin').textContent = 'User';
                    showSection('home');
                }
                
            } else {
                console.log('X Credenciales incorrectas');
                alert('Credenciales incorrectas, intenta con:\nusuario: admin\ncontraseña: admin123');
            }
        }).catch(error => {
            console.error('Error en la verificación:', error);
        });
    }
    
function showAdminPanel() {
    console.log('🚀 Mostrando panel de administración...');

    // Hide all sections
    const sections = ['home-section', 'services-section', 'contact-section', 'quote-section', 'login-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';        
        }
    });

    // Show admin panel
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        console.log('✅ Panel de admin visible');
        loadServicesTable();
    } else {
        console.error('❌ No se encontró el panel de admin');
        alert('Error: No se pudo cargar el panel de administración');
    }
}

function logout() {
    console.log('👋 Cerrando sesión...');
    isLoggedIn = false;

    // Clear any form data
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }

    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.reset();
    }

    // Reset editing state
    editingServiceId = null;
    document.getElementById('formTitle').textContent = 'Agregar Nuevo Servicio';

    // Show home section
    showSection('home');
    console.log('✅ Sesión cerrada, redirigido al inicio');
}

function loadServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';

    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        grid.appendChild(serviceCard);
    });
}

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.onclick = () => showServiceDetail(service);

    // Tarjeta simplificada - solo nombre y descripción
    card.innerHTML = `
                <div class="service-icon">${service.icon}</div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div class="card-click-hint">
                    <span>👆 Haz clic para ver detalles completos</span>
                </div>
            `;

    return card;
}

function showServiceDetail(service) {
    const modal = document.getElementById('serviceModal');
    const details = document.getElementById('serviceDetails');

    const promotionHtml = service.promotion
        ? `<div class="promotion" style="margin-top: 1rem;">🎉 ${service.promotion}</div>`
        : '';

    details.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${service.icon}</div>
                    <h2 style="color: #333; margin-bottom: 1rem;">${service.name}</h2>
                    
                    <!-- Información completa como se requiere en el punto 2 -->
                    <div style="background: #f8f9fa; padding: 2rem; border-radius: 15px; margin: 1.5rem 0; text-align: left;">
                        <h3 style="color: #667eea; margin-bottom: 1rem;">📋 Información Detallada:</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="background: white; padding: 1rem; border-radius: 10px;">
                                <strong>💰 Precio:</strong><br>
                                <span style="font-size: 1.2rem; color: #667eea; font-weight: bold;">
                                    ${service.price.toLocaleString('es-CO')} COP
                                </span>
                            </div>
                            <div style="background: white; padding: 1rem; border-radius: 10px;">
                                <strong>📦 Stock Disponible:</strong><br>
                                <span style="font-size: 1.2rem; color: ${service.stock > 5 ? '#28a745' : service.stock > 2 ? '#ffc107' : '#dc3545'};">
                                    ${service.stock} unidades
                                </span>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                            <strong>📝 Descripción Completa:</strong><br>
                            <p style="margin-top: 0.5rem; line-height: 1.6;">${service.description}</p>
                        </div>
                        
                        ${service.promotion ? `
                        <div style="background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 1rem; border-radius: 10px; border-left: 4px solid #28a745;">
                            <strong>🎁 Promoción Especial:</strong><br>
                            <span style="color: #155724; font-weight: 500;">${service.promotion}</span>
                        </div>
                        ` : `
                        <div style="background: #e9ecef; padding: 1rem; border-radius: 10px; text-align: center;">
                            <span style="color: #6c757d;">✨ Sin promociones activas actualmente</span>
                        </div>
                        `}
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="contactService('${service.name}', ${service.id})" style="margin-right: 1rem;">
                            📞 Solicitar Cotización
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal()">
                            ❌ Cerrar
                        </button>
                    </div>
                </div>
            `;

    modal.style.display = 'block';
}

function contactService(serviceName, serviceId = null) {
    console.log(`💼 Solicitud de cotización para: ${serviceName}`);

    // Find the service data
    let service = null;
    if (serviceId) {
        service = services.find(s => s.id === serviceId);
    } else {
        service = services.find(s => s.name === serviceName);
    }

    if (service) {
        // Fill service summary
        document.getElementById('selectedServiceIcon').textContent = service.icon;
        document.getElementById('selectedServiceName').textContent = service.name;
        document.getElementById('selectedServicePrice').textContent = `${service.price.toLocaleString('es-CO')} COP`;
        document.getElementById('selectedServiceStock').textContent = `${service.stock} unidades disponibles`;

        // Handle promotion
        const promotionContainer = document.getElementById('selectedServicePromotionContainer');
        const promotionText = document.getElementById('selectedServicePromotion');
        if (service.promotion) {
            promotionText.textContent = service.promotion;
            promotionContainer.style.display = 'block';
        } else {
            promotionContainer.style.display = 'none';
        }

        // Fill hidden form fields
        document.getElementById('quoteServiceId').value = service.id;
        document.getElementById('quoteServiceName').value = service.name;

        // Set project title placeholder
        document.getElementById('quoteProjectTitle').placeholder = `Proyecto de ${service.name}`;

        // Show service summary
        document.getElementById('serviceSummary').style.display = 'block';
    }

    // Close modal if open
    closeModal();

    // Show quote section
    showSection('quote');
}

function closeModal() {
    console.log('❌ Cerrando modal...');
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('✅ Modal cerrado');
    } else {
        console.error('❌ No se encontró el modal');
    }
}

function loadServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) {
        console.error('No se encontró la tabla de servicios');
        return;
    }

    tbody.innerHTML = '';

    if (!services || services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay servicios disponibles</td></tr>';
        return;
    }

    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${service.id}</td>
                    <td>${service.icon} ${service.name}</td>
                    <td>${service.price.toLocaleString('es-CO')}</td>
                    <td>${service.stock}</td>
                    <td>${service.promotion || 'Sin promoción'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-small btn-edit" onclick="editService(${service.id})">
                            Editar
                        </button>
                        <button class="btn btn-small btn-delete" onclick="deleteService(${service.id})">
                            Eliminar
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });
}

function handleServiceSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const serviceData = {
        name: formData.get('name'),
        price: parseInt(formData.get('price')),
        icon: formData.get('icon'),
        description: formData.get('description'),
        stock: parseInt(formData.get('stock')),
        promotion: formData.get('promotion') || ''
    };

    if (editingServiceId) {
        // Update existing service
        const index = services.findIndex(s => s.id === editingServiceId);
        services[index] = { ...serviceData, id: editingServiceId };
        editingServiceId = null;
        document.getElementById('formTitle').textContent = 'Agregar Nuevo Servicio';
    } else {
        // Add new service
        const newId = Math.max(...services.map(s => s.id)) + 1;
        services.push({ ...serviceData, id: newId });
    }

    // Reset form and reload data
    e.target.reset();
    document.getElementById('serviceId').value = '';
    loadServices();
    loadServicesTable();

    alert('Servicio guardado exitosamente');
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    editingServiceId = id;
    document.getElementById('formTitle').textContent = 'Editar Servicio';

    // Fill form
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceIcon').value = service.icon;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('serviceStock').value = service.stock;
    document.getElementById('servicePromotion').value = service.promotion;
}

function deleteService(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
        services = services.filter(s => s.id !== id);
        loadServices();
        loadServicesTable();
        alert('Servicio eliminado exitosamente');
    }
}

function cancelEdit() {
    editingServiceId = null;
    document.getElementById('formTitle').textContent = 'Agregar Nuevo Servicio';
    document.getElementById('serviceForm').reset();
}

// Funciones adicionales para manejar formularios
function handleContactSubmit(e) {
    e.preventDefault();
    alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
    e.target.reset();
}

function handleQuoteSubmit(e) {
    e.preventDefault();
    alert('Solicitud de cotización enviada correctamente. Te contactaremos en menos de 48 horas.');
    e.target.reset();
    showSection('home');
}

function closeQuoteForm() {
    showSection('services');
}