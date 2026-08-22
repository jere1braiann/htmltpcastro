// ==========================================
// 1. SISTEMA DE NAVEGACIÓN (Router SPA)
// ==========================================
function navegar(idVista) {
    document.querySelectorAll('.vista').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    document.getElementById(`vista-${idVista}`).classList.add('activa');

    if (idVista === 'actas') renderizarActas();
    if (idVista === 'foro') renderizarForo();
    if (idVista === 'admin-panel') renderizarResultados();
}

// ==========================================
// 2. MÓDULO ELECTORAL - ADMIN
// ==========================================
const CREDENCIAL_ADMIN = "ADMIN-IPEM38";

function loginAdmin() {
    const input = document.getElementById('codigo-admin').value.trim();
    const error = document.getElementById('error-admin');
    
    if (input === CREDENCIAL_ADMIN) {
        error.style.display = "none";
        document.getElementById('codigo-admin').value = ""; // limpia el campo
        navegar('admin-panel');
    } else {
        error.style.display = "block";
    }
}

function renderizarResultados() {
    // Cuenta cuántos votos totales hay en LocalStorage (simulando la DB)
    const votosStorage = JSON.parse(localStorage.getItem('votosEleccion')) || [];
    document.getElementById('contador-votos').innerText = votosStorage.length;

    // Cuenta votos por lista
    const contenedorResultados = document.getElementById('resultados-lista');
    contenedorResultados.innerHTML = "";

    listasElectorales.forEach(lista => {
        // Filtra y cuenta cuántos votos tiene esta lista
        const cantidad = votosStorage.filter(voto => voto === lista.id).length;
        contenedorResultados.innerHTML += `
            <li class="collection-item">
                <span class="title"><strong>${lista.nombre}</strong></span>
                <span class="badge blue white-text">${cantidad} votos</span>
            </li>
        `;
    });
}

// ==========================================
// 3. MÓDULO ELECTORAL - TERMINAL (Cuarto Oscuro)
// ==========================================
const padronSimulado = ["ALUMNO-1", "ALUMNO-2", "ALUMNO-3"];
let alumnosQueYaVotaron = JSON.parse(localStorage.getItem('votantesRegistrados')) || [];

const listasElectorales = [
    { id: 1, nombre: "Frente Estudiantil Unido", presi: "Ana García", color: "red" },
    { id: 2, nombre: "Renovación Secundaria", presi: "Martín López", color: "green" },
    { id: 3, nombre: "Voto en Blanco", presi: "-", color: "grey" }
];

function iniciarVotacion() {
    const codigo = document.getElementById('codigo-alumno').value.trim().toUpperCase();
    const msjError = document.getElementById('error-login');

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

    // Validado -> Entra al cuarto oscuro
    msjError.style.display = "none";
    document.getElementById('login-votante').style.display = "none";
    document.getElementById('pantalla-boletas').style.display = "block";
    renderizarBoletas(codigo);
}

function renderizarBoletas(codigoAlumno) {
    const contenedor = document.getElementById('contenedor-listas');
    contenedor.innerHTML = '';

    listasElectorales.forEach(lista => {
        contenedor.innerHTML += `
            <div class="col s12 m4">
                <div class="card ${lista.color} darken-2 white-text center-align" style="cursor:pointer;" onclick="emitirVoto(${lista.id}, '${codigoAlumno}')">
                    <div class="card-content">
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
        // 1. Guardar que el alumno votó (Para que no vuelva a entrar)
        alumnosQueYaVotaron.push(codigoAlumno);
        localStorage.setItem('votantesRegistrados', JSON.stringify(alumnosQueYaVotaron));

        // 2. Guardar el voto en la "Urna" de forma anónima (Solo el ID de la lista)
        const votosUrna = JSON.parse(localStorage.getItem('votosEleccion')) || [];
        votosUrna.push(idLista);
        localStorage.setItem('votosEleccion', JSON.stringify(votosUrna));

        alert("¡Voto registrado en la urna digital!");
        
        // 3. Resetear para el siguiente alumno
        document.getElementById('pantalla-boletas').style.display = "none";
        document.getElementById('login-votante').style.display = "block";
        document.getElementById('codigo-alumno').value = "";
    }
}

// ==========================================
// 4. MÓDULOS ACTAS Y FORO (Sin cambios mayores)
// ==========================================
const baseDatosActas = [
    { fecha: "15/05/2026", titulo: "Asamblea Conformación Junta Electoral", lugar: "SUM" },
    { fecha: "02/06/2026", titulo: "Presupuesto Bufet 2do Trimestre", lugar: "Aula 4" }
];

function renderizarActas() {
    const lista = document.getElementById('lista-actas');
    lista.innerHTML = '';
    baseDatosActas.forEach(acta => {
        lista.innerHTML += `
            <li class="collection-item avatar">
                <i class="material-icons circle blue">description</i>
                <span class="title"><strong>${acta.titulo}</strong></span>
                <p>${acta.fecha} - Lugar: ${acta.lugar}</p>
                <a href="#!" class="secondary-content"><i class="material-icons">file_download</i></a>
            </li>
        `;
    });
}

function obtenerPropuestas() {
    const datos = localStorage.getItem('foroDigital');
    return datos ? JSON.parse(datos) : [
        { titulo: "Más tachos de reciclaje", texto: "Necesitamos separar la basura en los patios.", votos: 5 }
    ];
}

function renderizarForo() {
    const contenedor = document.getElementById('lista-propuestas');
    contenedor.innerHTML = '';
    const propuestas = obtenerPropuestas();
    propuestas.sort((a, b) => b.votos - a.votos).forEach((prop, index) => {
        contenedor.innerHTML += `
            <div class="card">
                <div class="card-content">
                    <span class="card-title">${prop.titulo} <span class="badge blue white-text">${prop.votos} votos</span></span>
                    <p>${prop.texto}</p>
                </div>
                <div class="card-action">
                    <button class="btn-small blue" onclick="votarPropuesta(${index})">Apoyar (+1)</button>
                </div>
            </div>
        `;
    });
}

function agregarPropuesta() {
    const titulo = document.getElementById('titulo-propuesta').value;
    const texto = document.getElementById('texto-propuesta').value;
    if(titulo === "" || texto === "") return alert("Completa los campos");

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
