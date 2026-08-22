// ==========================================
// 1. SISTEMA DE NAVEGACIÓN
// ==========================================
function navegar(idVista) {
    document.querySelectorAll('.vista').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    document.getElementById(`vista-${idVista}`).classList.add('activa');

    if (idVista === 'admin-panel') renderizarPanelAdmin();
}

// ==========================================
// 2. GESTIÓN DE LISTAS Y URNA (Base de datos local)
// ==========================================
const CREDENCIAL_ADMIN = "ADMIN-IPEM38";
const padronSimulado = ["ALUMNO-1", "ALUMNO-2", "ALUMNO-3", "ALUMNO-4", "ALUMNO-5"];

// Función vital: Si no hay listas guardadas, crea la de Voto en Blanco por defecto.
function obtenerListas() {
    let listas = JSON.parse(localStorage.getItem('listasOficiales'));
    if (!listas) {
        listas = [{ id: 99, numero: "0", nombre: "Voto en Blanco", presi: "Ninguno", color: "grey" }];
        localStorage.setItem('listasOficiales', JSON.stringify(listas));
    }
    return listas;
}

// ==========================================
// 3. MÓDULO ELECTORAL - ADMIN
// ==========================================
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
    const color = document.getElementById('input-color').value;

    if (!numero || !nombre || !presi || !color) {
        alert("Por favor, completa los cuatro campos para oficializar la lista.");
        return;
    }

    const listas = obtenerListas();
    // Genera un ID único para uso interno
    const nuevoId = new Date().getTime(); 
    
    listas.push({ id: nuevoId, numero: numero, nombre: nombre, presi: presi, color: color });
    localStorage.setItem('listasOficiales', JSON.stringify(listas));
    
    // Limpiar formulario
    document.getElementById('input-numero').value = "";
    document.getElementById('input-nombre-partido').value = "";
    document.getElementById('input-presidente').value = "";
    document.getElementById('input-color').value = "";

    renderizarPanelAdmin();
    alert("Lista " + numero + " cargada con éxito en el sistema.");
}

function renderizarPanelAdmin() {
    // 1. Mostrar estado de la urna
    const votosStorage = JSON.parse(localStorage.getItem('votosEleccion')) || [];
    document.getElementById('contador-votos').innerText = votosStorage.length;

    // 2. Mostrar las listas configuradas
    const contenedorListas = document.getElementById('admin-listas-activas');
    contenedorListas.innerHTML = "";
    const listas = obtenerListas();

    listas.forEach(lista => {
        // Calcula los votos de esa lista
        const cantVotos = votosStorage.filter(v => v === lista.id).length;
        
        contenedorListas.innerHTML += `
            <div class="boleta-preview ${lista.color} darken-1">
                <strong>Lista ${lista.numero} - ${lista.nombre}</strong><br>
                Candidato: ${lista.presi}
                <span class="badge white black-text right">${cantVotos} VOTOS</span>
            </div>
        `;
    });
}

function resetearUrna() {
    const seguro = confirm("⚠️ ATENCIÓN: Esto borrará todas las listas creadas, vaciará la urna y pondrá el padrón en cero. ¿Estás seguro?");
    if (seguro) {
        localStorage.removeItem('listasOficiales');
        localStorage.removeItem('votosEleccion');
        localStorage.removeItem('votantesRegistrados');
        renderizarPanelAdmin();
    }
}

// ==========================================
// 4. MÓDULO ELECTORAL - TERMINAL (Cuarto Oscuro)
// ==========================================
function iniciarVotacion() {
    const codigo = document.getElementById('codigo-alumno').value.trim().toUpperCase();
    const msjError = document.getElementById('error-login');
    let alumnosQueYaVotaron = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];

    if (!padronSimulado.includes(codigo)) {
        msjError.innerText = "Código de padrón inválido.";
        msjError.style.display = "block";
        return;
    }

    if (alumnosQueYaVotaron.includes(codigo)) {
        msjError.innerText = "Atención: Este código ya emitió su voto.";
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
    const listas = obtenerListas();

    listas.forEach(lista => {
        contenedor.innerHTML += `
            <div class="col s12 m4">
                <div class="card ${lista.color} darken-2 white-text center-align" style="cursor:pointer;" onclick="emitirVoto(${lista.id}, '${codigoAlumno}')">
                    <div class="card-content">
                        <h5>Lista ${lista.numero}</h5>
                        <h4>${lista.nombre}</h4>
                        <p>Presidente: ${lista.presi}</p>
                        <br>
                        <button class="btn white black-text">SELECCIONAR</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function emitirVoto(idLista, codigoAlumno) {
    if (confirm("¿Confirmas tu voto?")) {
        // 1. Guardar que el alumno votó
        let alumnosQueYaVotaron = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];
        alumnosQueYaVotaron.push(codigoAlumno);
        localStorage.setItem('votantesRegistrados', JSON.stringify(alumnosQueYaVotaron));

        // 2. Guardar el voto anónimo en la urna
        const votosUrna = JSON.parse(localStorage.getItem('votosEleccion')) || [];
        votosUrna.push(idLista);
        localStorage.setItem('votosEleccion', JSON.stringify(votosUrna));

        alert("¡Voto registrado en la urna digital!");
        
        // 3. Reset
        document.getElementById('pantalla-boletas').style.display = "none";
        document.getElementById('login-votante').style.display = "block";
        document.getElementById('codigo-alumno').value = "";
    }
}
