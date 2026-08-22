// ==========================================
// 1. MOTOR DE NAVEGACIÓN (SPA ROUTER)
// ==========================================
function navegar(idVista) {
    document.querySelectorAll('.vista').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    document.getElementById(`vista-${idVista}`).classList.add('activa');

    // Disparadores automáticos al cambiar de pantalla
    if (idVista === 'actas') renderizarActas();
    if (idVista === 'foro') renderizarForo();
    if (idVista === 'admin-panel') renderizarPanelAdmin();
}

// ==========================================
// 2. MÓDULO ELECTORAL: JUNTA ELECTORAL (ADMIN)
// ==========================================
const CREDENCIAL_ADMIN = "ADMIN-IPEM38";
const PADRON_SIMULADO = ["ALUMNO-1", "ALUMNO-2", "ALUMNO-3", "ALUMNO-4", "ALUMNO-5"];

function obtenerListas() {
    let listas = JSON.parse(localStorage.getItem('listasOficiales'));
    if (!listas || listas.length === 0) {
        // Lista por defecto si la base está vacía
        listas = [{ id: 99, numero: "0", nombre: "Voto en Blanco", presi: "-", vice: "-", curso: "-", color: "grey" }];
        localStorage.setItem('listasOficiales', JSON.stringify(listas));
    }
    return listas;
}

function loginAdmin() {
    const input = document.getElementById('codigo-admin').value.trim();
    if (input === CREDENCIAL_ADMIN) {
        document.getElementById('error-admin').style.display = "none";
        document.getElementById('codigo-admin').value = "";
        navegar('admin-panel');
    } else {
        document.getElementById('error-admin').style.display = "block";
    }
}

function agregarLista() {
    const numero = document.getElementById('input-numero').value;
    const nombre = document.getElementById('input-nombre-partido').value;
    const presi = document.getElementById('input-presidente').value;
    const vice = document.getElementById('input-vicepresidente').value;
    const curso = document.getElementById('input-curso').value;
    const color = document.getElementById('input-color').value;
    const tieneAval = document.getElementById('check-aval').checked;

    if (!numero || !nombre || !presi || !vice || !curso || !color) {
        return alert("Error: Completa todos los campos de la fórmula para oficializar la lista.");
    }
    if (!tieneAval) {
        return alert("Rechazado: Según Art. 28 de la Res. 124/2010, no se puede oficializar sin el aval escrito del 10% del padrón.");
    }

    const listas = obtenerListas();
    listas.push({ 
        id: new Date().getTime(), numero, nombre, presi, vice, curso, color 
    });
    localStorage.setItem('listasOficiales', JSON.stringify(listas));
    
    // Limpiar formulario
    document.querySelectorAll('#vista-admin-panel input').forEach(input => input.value = '');
    document.getElementById('check-aval').checked = false;
    
    alert(`Lista ${numero} - ${nombre} ha sido oficializada con éxito.`);
    renderizarPanelAdmin();
}

function renderizarPanelAdmin() {
    const votosStorage = JSON.parse(localStorage.getItem('votosEleccion')) || [];
    document.getElementById('contador-votos').innerText = votosStorage.length;

    const contenedorListas = document.getElementById('admin-listas-activas');
    contenedorListas.innerHTML = "";
    
    obtenerListas().forEach(lista => {
        const cantVotos = votosStorage.filter(v => v === lista.id).length;
        contenedorListas.innerHTML += `
            <div class="boleta-preview ${lista.color} darken-1">
                <strong>Lista ${lista.numero} - ${lista.nombre}</strong><br>
                Fórmula: ${lista.presi} y ${lista.vice}<br>
                <small>Candidatos de: ${lista.curso}</small>
                <span class="badge white black-text right" style="font-weight:bold;">${cantVotos} VOTOS</span>
            </div>
        `;
    });
}

function resetearUrna() {
    if (confirm("⚠️ ATENCIÓN: Esto eliminará los votos, reiniciará el padrón y borrará las listas creadas. ¿Proceder?")) {
        localStorage.removeItem('listasOficiales');
        localStorage.removeItem('votosEleccion');
        localStorage.removeItem('votantesRegistrados');
        renderizarPanelAdmin();
    }
}

// ==========================================
// 3. MÓDULO ELECTORAL: CUARTO OSCURO (ESTUDIANTE)
// ==========================================
function iniciarVotacion() {
    const codigo = document.getElementById('codigo-alumno').value.trim().toUpperCase();
    const msjError = document.getElementById('error-login');
    let alumnosQueYaVotaron = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];

    if (!PADRON_SIMULADO.includes(codigo)) {
        msjError.innerText = "Error: El código ingresado no figura en el padrón electoral.";
        msjError.style.display = "block";
        return;
    }
    if (alumnosQueYaVotaron.includes(codigo)) {
        msjError.innerText = "Operación Rechazada: Este código de identificación ya emitió su voto.";
        msjError.style.display = "block";
        return;
    }

    msjError.style.display = "none";
    document.getElementById('login-votante').style.display = "none";
    document.getElementById('pantalla-boletas').style.display = "block";
    renderizarBoletasVotante(codigo);
}

function renderizarBoletasVotante(codigoAlumno) {
    const contenedor = document.getElementById('contenedor-listas');
    contenedor.innerHTML = '';
    
    obtenerListas().forEach(lista => {
        contenedor.innerHTML += `
            <div class="col s12 m6 l4">
                <div class="card ${lista.color} darken-2 white-text center-align hoverable" style="cursor:pointer; border-radius: 10px;" onclick="emitirVoto(${lista.id}, '${codigoAlumno}')">
                    <div class="card-content">
                        <h5>Lista ${lista.numero}</h5>
                        <h4 style="font-weight:bold;">${lista.nombre}</h4>
                        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin: 15px 0;">
                            <p><strong>Presidente:</strong> ${lista.presi}</p>
                            <p><strong>Vicepresidente:</strong> ${lista.vice}</p>
                        </div>
                        <button class="btn white black-text" style="font-weight:bold; width: 100%;">INGRESAR BOLETA</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function emitirVoto(idLista, codigoAlumno) {
    if (confirm("Estás por ingresar tu voto en la urna digital. ¿Confirmas tu selección? (El voto es secreto y definitivo)")) {
        
        // Registrar al estudiante (para que no vuelva a votar)
        let votantes = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];
        votantes.push(codigoAlumno);
        localStorage.setItem('votantesRegistrados', JSON.stringify(votantes));

        // Registrar el voto (anónimo, solo se guarda el ID de la lista elegida)
        let votosUrna = JSON.parse(localStorage.getItem('votosEleccion')) || [];
        votosUrna.push(idLista);
        localStorage.setItem('votosEleccion', JSON.stringify(votosUrna));

        alert("¡Sufragio exitoso! Tu voto ha sido registrado en la urna digital.");
        
        // Resetear la terminal para el próximo estudiante
        document.getElementById('pantalla-boletas').style.display = "none";
        document.getElementById('login-votante').style.display = "block";
        document.getElementById('codigo-alumno').value = "";
    }
}

// ==========================================
// 4. MÓDULO: LIBRO DE ACTAS
// ==========================================
const BASE_DATOS_ACTAS = [
    { fecha: "15/05/2026", titulo: "Asamblea: Conformación Junta Electoral", lugar: "SUM", firma: "Aprobada" },
    { fecha: "02/06/2026", titulo: "Resolución: Presupuesto Bufet", lugar: "Aula 4", firma: "Aprobada" }
];

function renderizarActas() {
    const lista = document.getElementById('lista-actas');
    lista.innerHTML = '';
    BASE_DATOS_ACTAS.forEach(acta => {
        lista.innerHTML += `
            <li class="collection-item avatar">
                <i class="material-icons circle blue darken-2">history_edu</i>
                <span class="title"><strong>${acta.titulo}</strong></span>
                <p>${acta.fecha} | Lugar: ${acta.lugar} <br> <span class="green-text">Estado: ${acta.firma}</span></p>
                <a href="#!" class="secondary-content" title="Descargar PDF"><i class="material-icons grey-text">file_download</i></a>
            </li>
        `;
    });
}

// ==========================================
// 5. MÓDULO: FORO INTER-CENTROS
// ==========================================
function obtenerPropuestas() {
    const datos = localStorage.getItem('foroDigital');
    return datos ? JSON.parse(datos) : [
        { titulo: "Más tachos de reciclaje", texto: "Necesitamos separar la basura en los patios del colegio.", votos: 12 },
        { titulo: "Torneo de E-Sports", texto: "Organizar un torneo intercolegial a fin de año.", votos: 8 }
    ];
}

function renderizarForo() {
    const contenedor = document.getElementById('lista-propuestas');
    contenedor.innerHTML = '';
    const propuestas = obtenerPropuestas();
    
    // Ordenar de mayor a menor cantidad de votos
    propuestas.sort((a, b) => b.votos - a.votos).forEach((prop, index) => {
        contenedor.innerHTML += `
            <div class="card hoverable">
                <div class="card-content">
                    <span class="card-title" style="font-weight:bold;">${prop.titulo} <span class="badge blue white-text right" style="border-radius: 4px;">${prop.votos} votos</span></span>
                    <p>${prop.texto}</p>
                </div>
                <div class="card-action">
                    <button class="btn-small blue lighten-1 black-text" style="font-weight:bold;" onclick="votarPropuesta(${index})"><i class="material-icons left">thumb_up</i> Apoyar Idea</button>
                </div>
            </div>
        `;
    });
}

function agregarPropuesta() {
    const titulo = document.getElementById('titulo-propuesta').value;
    const texto = document.getElementById('texto-propuesta').value;
    
    if(!titulo || !texto) return alert("Por favor, completa el título y la descripción de tu propuesta.");

    const propuestas = obtenerPropuestas();
    propuestas.push({ titulo, texto, votos: 0 });
    localStorage.setItem('foroDigital', JSON.stringify(propuestas));
    
    document.getElementById('titulo-propuesta').value = "";
    document.getElementById('texto-propuesta').value = "";
    renderizarForo();
}

function votarPropuesta(index) {
    const propuestas = obtenerPropuestas();
    propuestas[index].votos++;
    localStorage.setItem('foroDigital', JSON.stringify(propuestas));
    renderizarForo();
}

// Iniciar la aplicación mostrando el inicio por defecto
document.addEventListener('DOMContentLoaded', () => {
    navegar('inicio');
});
