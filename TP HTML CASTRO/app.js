// ==========================================
// BASE DE DATOS DE ROLES (Autenticación estática)
// ==========================================
const CREDENCIALES_SISTEMA = {
    // 1. Comisión Directiva: Puede crear Actas y subir proyectos al Foro.
    "CD-IPEM38": { colegio: "IPEM 38", rol: "Comisión Directiva", tipo: "CD" },
    "CD-TECNICA": { colegio: "Esc. Técnica 1", rol: "Comisión Directiva", tipo: "CD" },
    
    // 2. Junta Electoral: Control total sobre padrón, urnas y oficialización de boletas.
    "JUNTA-IPEM38": { colegio: "IPEM 38", rol: "Junta Electoral", tipo: "JUNTA" },
    "JUNTA-TECNICA": { colegio: "Esc. Técnica 1", rol: "Junta Electoral", tipo: "JUNTA" }
};

// ==========================================
// 1. SISTEMA DE NAVEGACIÓN Y SESIÓN (Router)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesionUI();
    navegar('inicio');
});

function navegar(idVista) {
    document.querySelectorAll('.vista').forEach(seccion => seccion.classList.remove('activa'));
    document.getElementById(`vista-${idVista}`).classList.add('activa');
    
    // Refresco de datos automático al entrar a una vista
    if (idVista === 'actas') renderizarActas();
    if (idVista === 'foro') renderizarForo();
    if (idVista === 'admin-panel') renderizarPanelAdmin();
}

function iniciarSesion() {
    const input = document.getElementById('input-credencial').value.trim().toUpperCase();
    const errorMsg = document.getElementById('error-login-inst');
    const cuenta = CREDENCIALES_SISTEMA[input];

    if (cuenta) {
        sessionStorage.setItem('usuarioLogueado', JSON.stringify(cuenta));
        errorMsg.style.display = "none";
        document.getElementById('input-credencial').value = "";
        
        verificarSesionUI();
        M.toast({html: `Bienvenido, ${cuenta.colegio} (${cuenta.tipo})`, classes: 'green rounded'});
        navegar('inicio');
    } else {
        errorMsg.style.display = "block";
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('usuarioLogueado');
    verificarSesionUI();
    M.toast({html: 'Sesión cerrada correctamente.', classes: 'grey rounded'});
    navegar('inicio');
}

function resetearSistema() {
    if(confirm("🛑 ATENCIÓN: Acción destructiva. Se borrará toda la configuración, actas, foro y votos. ¿Continuar?")) {
        localStorage.clear();
        sessionStorage.clear();
        alert("Sistema formateado.");
        window.location.reload();
    }
}

// Interfaz Dinámica según el Rol guardado en SessionStorage
function verificarSesionUI() {
    const userJson = sessionStorage.getItem('usuarioLogueado');
    const user = userJson ? JSON.parse(userJson) : null;
    
    if (user) {
        document.getElementById('nav-login-btn').style.display = 'none';
        document.getElementById('nav-user-info').style.display = 'inline-block';
        document.getElementById('nav-logout-btn').style.display = 'inline-block';
        document.getElementById('nombre-colegio-nav').innerText = user.colegio;
        document.getElementById('rol-nav').innerText = user.tipo;
        document.getElementById('nav-icono-rol').innerText = user.tipo === 'JUNTA' ? 'gavel' : 'account_balance';

        // Lógica de Permisos
        if (user.tipo === 'CD') {
            document.getElementById('panel-admin-actas').style.display = 'block';
            document.getElementById('panel-admin-foro').style.display = 'block';
        } else {
            document.getElementById('panel-admin-actas').style.display = 'none';
            document.getElementById('panel-admin-foro').style.display = 'none';
        }
    } else {
        // Vista Pública (Modo solo lectura y acceso a cuarto oscuro)
        document.getElementById('nav-login-btn').style.display = 'inline-block';
        document.getElementById('nav-user-info').style.display = 'none';
        document.getElementById('nav-logout-btn').style.display = 'none';
        document.getElementById('panel-admin-actas').style.display = 'none';
        document.getElementById('panel-admin-foro').style.display = 'none';
    }
}

// ==========================================
// 2. MÓDULO ELECTORAL (Exclusivo Junta)
// ==========================================
function accederPanelJunta() {
    const userJson = sessionStorage.getItem('usuarioLogueado');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
        M.toast({html: 'Acceso Denegado: Inicia sesión.', classes: 'red rounded'});
        return navegar('login');
    }
    
    if (user.tipo !== 'JUNTA') {
        alert("🔒 Acceso Bloqueado: Estatutariamente, solo la Junta Electoral tiene competencia para organizar elecciones. Tu credencial corresponde a la Comisión Directiva.");
        return;
    }
    
    document.getElementById('nombre-colegio-junta').innerText = user.colegio;
    navegar('admin-panel');
}

function obtenerListas() {
    let listas = JSON.parse(localStorage.getItem('listasOficiales'));
    if (!listas || listas.length === 0) {
        listas = [{ id: 99, numero: "0", nombre: "Voto en Blanco", presi: "-", vice: "-", curso: "-", color: "grey" }];
        localStorage.setItem('listasOficiales', JSON.stringify(listas));
    }
    return listas;
}

function agregarLista() {
    const numero = document.getElementById('input-numero').value;
    const nombre = document.getElementById('input-nombre-partido').value;
    const presi = document.getElementById('input-presidente').value;
    const vice = document.getElementById('input-vicepresidente').value;
    const curso = document.getElementById('input-curso').value;
    const color = document.getElementById('input-color').value;
    const tieneAval = document.getElementById('check-aval').checked;

    if (!numero || !nombre || !presi || !vice || !curso || !color) return M.toast({html: 'Complete todos los datos.', classes: 'orange'});
    if (!tieneAval) return alert("Rechazo Legal: No se puede oficializar sin el aval del 10% del padrón.");

    const listas = obtenerListas();
    listas.push({ id: new Date().getTime(), numero, nombre, presi, vice, curso, color });
    localStorage.setItem('listasOficiales', JSON.stringify(listas));
    
    document.querySelectorAll('#vista-admin-panel input').forEach(input => input.value = '');
    document.getElementById('check-aval').checked = false;
    M.toast({html: 'Lista Oficializada con éxito.', classes: 'green rounded'});
    renderizarPanelAdmin();
}

function renderizarPanelAdmin() {
    const votos = JSON.parse(localStorage.getItem('votosEleccion')) || [];
    document.getElementById('contador-votos').innerText = votos.length;
    const cont = document.getElementById('admin-listas-activas');
    cont.innerHTML = "";
    obtenerListas().forEach(lista => {
        const cant = votos.filter(v => v === lista.id).length;
        cont.innerHTML += `
            <div class="boleta-preview ${lista.color} darken-1">
                <strong>Lista ${lista.numero} - ${lista.nombre}</strong><br>
                <span style="font-size:0.9rem;">Fórmula: ${lista.presi} / ${lista.vice}</span>
                <span class="badge white black-text right" style="font-weight:bold; border-radius:12px;">${cant} VOTOS</span>
            </div>`;
    });
}

function resetearUrna() {
    if (confirm("⚠️ ¿Vaciar la urna y reiniciar el padrón de electores? Las listas creadas se conservarán.")) {
        localStorage.removeItem('votosEleccion');
        localStorage.removeItem('votantesRegistrados');
        M.toast({html: 'Urna Vaciada.', classes: 'grey rounded'});
        renderizarPanelAdmin();
    }
}

// ==========================================
// 3. CUARTO OSCURO DIGITAL
// ==========================================
const PADRON_CODIGOS = ["ELECTOR-001", "ELECTOR-002", "ELECTOR-003", "ELECTOR-004"];

function iniciarVotacion() {
    const codigo = document.getElementById('codigo-alumno').value.trim().toUpperCase();
    const error = document.getElementById('error-login-voto');
    const yaVotaron = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];

    if (!PADRON_CODIGOS.includes(codigo)) {
        return (error.innerText = "Error: Código de Elector inexistente.", error.style.display = "block");
    }
    if (yaVotaron.includes(codigo)) {
        return (error.innerText = "Fraude Detectado: Este Código ya fue utilizado para votar.", error.style.display = "block");
    }

    error.style.display = "none";
    document.getElementById('login-votante').style.display = "none";
    document.getElementById('pantalla-boletas').style.display = "block";
    renderizarBoletas(codigo);
}

function renderizarBoletas(codigo) {
    const cont = document.getElementById('contenedor-listas');
    cont.innerHTML = '';
    obtenerListas().forEach(lista => {
        cont.innerHTML += `
            <div class="col s12 m6 l4">
                <div class="card ${lista.color} darken-2 white-text center-align hoverable" style="border-radius:12px; cursor:pointer;" onclick="emitirVoto(${lista.id}, '${codigo}')">
                    <div class="card-content">
                        <h5>Lista ${lista.numero}</h5>
                        <h4 style="font-weight:bold;">${lista.nombre}</h4>
                        <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:12px; margin:15px 0;">
                            <p style="margin:0;"><strong>Presidente:</strong> ${lista.presi}</p>
                            <p style="margin:0;"><strong>Vicepresidente:</strong> ${lista.vice}</p>
                        </div>
                        <button class="btn white black-text w100" style="font-weight:bold; border-radius:6px;">SELECCIONAR</button>
                    </div>
                </div>
            </div>`;
    });
}

function emitirVoto(id, cod) {
    if (confirm("¿Ingresar tu voto a la urna digital? Esta acción no se puede deshacer.")) {
        // Invalidar Código de Elector
        let v = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];
        v.push(cod); localStorage.setItem('votantesRegistrados', JSON.stringify(v));
        
        // Registrar Voto Anónimo
        let u = JSON.parse(localStorage.getItem('votosEleccion')) || [];
        u.push(id); localStorage.setItem('votosEleccion', JSON.stringify(u));

        alert("¡Sufragio Exitoso! Voto encriptado en urna.");
        document.getElementById('pantalla-boletas').style.display = "none";
        document.getElementById('login-votante').style.display = "block";
        document.getElementById('codigo-alumno').value = "";
    }
}

// ==========================================
// 4. LIBRO DE ACTAS MATRIZ (Exclusivo CD)
// ==========================================
function obtenerActas() {
    return JSON.parse(localStorage.getItem('libroActas')) || [];
}

function renderizarActas() {
    const lista = document.getElementById('lista-actas');
    lista.innerHTML = '';
    
    let actas = obtenerActas();
    if(actas.length === 0) lista.innerHTML = '<li class="collection-item grey-text">No hay actas digitalizadas.</li>';
    
    actas.slice().reverse().forEach(acta => {
        lista.innerHTML += `
            <li class="collection-item">
                <span class="title" style="font-weight:bold; font-size:1.1rem; color:#1565c0;">${acta.titulo}</span>
                <p>
                    <i class="material-icons tiny">event</i> ${acta.fecha} | <i class="material-icons tiny">place</i> ${acta.lugar}<br><br>
                    <span style="background-color: #f5f5f5; padding: 10px; border-left: 3px solid #1565c0; display: block; border-radius: 4px;"><em>${acta.texto}</em></span><br>
                    <span class="green-text text-darken-2"><i class="material-icons tiny">verified</i> <strong>Sello y Firmas:</strong> ${acta.firmas}</span>
                </p>
            </li>`;
    });
}

function agregarActa() {
    const user = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    const titulo = document.getElementById('acta-titulo').value.trim();
    const fecha = document.getElementById('acta-fecha').value;
    const lugar = document.getElementById('acta-lugar').value.trim();
    const texto = document.getElementById('acta-texto').value.trim();
    const firmas = document.getElementById('acta-firmas').value.trim();

    if (!titulo || !fecha || !lugar || !texto || !firmas) return M.toast({html: 'Rellene todos los campos.', classes: 'red rounded'});
    
    const actas = obtenerActas();
    const firmaDigital = `${firmas} (Oficializado por: CD ${user.colegio})`;
    
    actas.push({ titulo, fecha, lugar, texto, firmas: firmaDigital });
    localStorage.setItem('libroActas', JSON.stringify(actas));
    
    document.querySelectorAll('#panel-admin-actas input, #panel-admin-actas textarea').forEach(i => i.value = '');
    M.toast({html: 'Acta guardada en la matriz institucional.', classes: 'green rounded'});
    renderizarActas();
}

// ==========================================
// 5. FORO INTER-CENTROS (Exclusivo CD)
// ==========================================
function obtenerPropuestas() {
    return JSON.parse(localStorage.getItem('foroDigital')) || [
        { titulo: "Campaña de Reciclaje", texto: "Separación de residuos en todos los patios.", votos: 15, colegio: "CD - IPEM 38" },
        { titulo: "Olimpíadas Matemáticas", texto: "Torneo intercolegial de fin de año.", votos: 8, colegio: "CD - Esc. Técnica 1" }
    ];
}

function renderizarForo() {
    const cont = document.getElementById('lista-propuestas');
    cont.innerHTML = '';
    obtenerPropuestas().sort((a, b) => b.votos - a.votos).forEach((prop, i) => {
        cont.innerHTML += `
            <div class="card" style="border-radius:10px;">
                <div class="card-content">
                    <span class="card-title" style="font-weight:bold;">${prop.titulo} <span class="badge blue white-text right" style="border-radius:12px;">${prop.votos} VOTOS</span></span>
                    <p>${prop.texto}</p>
                    <br>
                    <small class="grey-text">Proyecto Oficial Autorizado por: <strong>${prop.colegio}</strong></small>
                </div>
                <div class="card-action">
                    <button class="btn-small blue lighten-1 black-text waves-effect" style="border-radius:20px; font-weight:bold;" onclick="votarPropuesta(${i})">Apoyar Proyecto</button>
                </div>
            </div>`;
    });
}

function agregarPropuesta() {
    const user = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    const titulo = document.getElementById('titulo-propuesta').value.trim();
    const texto = document.getElementById('texto-propuesta').value.trim();
    
    if(!titulo || !texto) return M.toast({html: 'Complete el formulario del proyecto.', classes: 'red rounded'});

    const prop = obtenerPropuestas();
    prop.push({ titulo, texto, votos: 0, colegio: `CD - ${user.colegio}` });
    localStorage.setItem('foroDigital', JSON.stringify(prop));
    
    document.getElementById('titulo-propuesta').value = "";
    document.getElementById('texto-propuesta').value = "";
    M.toast({html: 'Proyecto publicado en el foro.', classes: 'green rounded'});
    renderizarForo();
}

function votarPropuesta(i) {
    const prop = obtenerPropuestas();
    prop[i].votos++;
    localStorage.setItem('foroDigital', JSON.stringify(prop));
    renderizarForo();
}
