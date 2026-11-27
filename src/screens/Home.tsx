import { NotaLegal } from "../components/NotaLegal";
import { CONFIG } from "../config/demo.config";
import { dinero } from "../domain/format";
import { navegar, RUTAS } from "../state/router";
import { useDemo } from "../state/store";
import caja from "../assets/figma/home/ql-box.png";
import reporte from "../assets/figma/home/ql-report.png";
import estadisticas from "../assets/figma/home/ql-statistics.png";
import incorporar from "../assets/figma/home/ql-incorporate.png";
import cursos from "../assets/figma/home/ql-graduate.png";
import indVenta from "../assets/figma/home/ind-venta.png";
import indGanancia from "../assets/figma/home/ind-ganancia.png";
import indActivas from "../assets/figma/home/ind-activas.png";
import indDeuda from "../assets/figma/home/ind-deuda.png";
import indCredito from "../assets/figma/home/ind-credito.png";
import chevron from "../assets/figma/home/chevron-right.svg";
import isotipo from "../assets/figma/home/isotipo.svg";
import fotoDirectora from "../assets/figma/modal-1/photo-directora.jpg";
import graduada from "../assets/figma/dir-home/banner-graduate.png";

const ACCESOS = [
  { etiqueta: "Realizar pedido", icono: caja },
  { etiqueta: "Reportes", icono: reporte, espejo: true },
  { etiqueta: "Elige crecer", icono: estadisticas },
  { etiqueta: "Incorporar", icono: incorporar },
  { etiqueta: "Mis cursos", icono: cursos },
];

export function Home() {
  const { sesion, perfil, mio, abrirFlujo, abrirPopupBono } = useDemo();
  const { campana } = perfil;

  const indicadores = [
    {
      etiqueta: "Venta de GP",
      valor: dinero(campana.ventaGP),
      icono: indVenta,
    },
    ...(perfil.gananciaActual !== null
      ? [
          {
            etiqueta: "Ganancia estimada",
            valor: dinero(perfil.gananciaActual),
            icono: indGanancia,
            destacado: true,
          },
        ]
      : []),
    {
      etiqueta: "Activas del grupo",
      valor: String(campana.activasGrupo),
      icono: indActivas,
      clase: "indicador__icono--activas",
    },
    {
      etiqueta: "Deuda actual",
      valor: dinero(campana.deudaActual),
      icono: indDeuda,
    },
    {
      etiqueta: "Crédito Yanbal",
      valor: dinero(campana.creditoYanbal),
      icono: indCredito,
      clase: "indicador__icono--credito",
    },
  ];

  // Banner de carrera: solo Emprendedoras que aún no registran su sueño.
  const conBannerCarrera = perfil.grupo === "emprendedora" && !mio.sueno;
  // Banner de formación: Directoras Junior y Senior. Siempre abre Formaciones con el popup.
  const conBannerBono = perfil.grupo === "directora";
  const verBono = () => {
    abrirPopupBono();
    navegar(RUTAS.formaciones);
  };

  return (
    <>
      <section className="saludo">
        <p className="saludo__actualizado">{CONFIG.campana.actualizado}</p>
        <div className="saludo__fila">
          <div>
            <h1 className="t-titulo">¡Hola, {sesion?.nombre}!</h1>
            <p className="saludo__pregunta">¿Qué vas a hacer hoy?</p>
          </div>
          <fry-chip
            type="action-icon"
            size="small"
            icon="calendar-outline"
            label={CONFIG.campana.etiqueta}
          />
        </div>
      </section>

      <ul className="accesos">
        {ACCESOS.map((a) => (
          <li className="acceso" key={a.etiqueta}>
            <img
              src={a.icono}
              alt=""
              className={a.espejo ? "acceso__icono--espejo" : ""}
            />
            {a.etiqueta}
          </li>
        ))}
      </ul>

      <section className="campana">
        <h2 className="campana__titulo">Mi Campaña</h2>
        <ul className="campana__tarjetas">
          {indicadores.map((i) => (
            <li key={i.etiqueta}>
              {/* "Ganancia estimada" lleva a Mi negocio, como en el Figma; las demás no tienen acción en la demo */}
              <button
                className="indicador"
                onClick={
                  i.destacado ? () => navegar(RUTAS.miNegocio) : undefined
                }
                aria-label={
                  i.destacado
                    ? `${i.etiqueta}: ${i.valor}. Ver Mi negocio`
                    : undefined
                }
              >
                <span className="indicador__cabecera">
                  <span className={`indicador__icono ${i.clase ?? ""}`}>
                    <img src={i.icono} alt="" />
                  </span>
                  <img className="indicador__chevron" src={chevron} alt="" />
                </span>
                <span className="indicador__etiqueta">{i.etiqueta}</span>
                <b
                  className={`indicador__valor ${i.destacado ? "indicador__valor--destacado" : ""}`}
                >
                  {i.valor}
                </b>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {(conBannerCarrera || conBannerBono) && (
        <section className="anuncios">
          <div className="anuncios__carrusel">
            {conBannerCarrera && (
              <button
                className="anuncio"
                onClick={() => abrirFlujo("beneficios")}
              >
                <span className="anuncio__texto">
                  <span className="anuncio__etiqueta">Carrera Yanbal</span>
                  <span>
                    Con la Carrera Yanbal puedes ganar{" "}
                    <b>desde {dinero(CONFIG.gananciaDirectora)} por campaña*</b>
                  </span>
                </span>
                <span className="anuncio__foto">
                  <img src={fotoDirectora} alt="" />
                </span>
              </button>
            )}
            {conBannerBono && (
              <button className="anuncio" onClick={verBono}>
                <span className="anuncio__texto">
                  <span className="anuncio__etiqueta">Formaciones</span>
                  <span>
                    Forma a una nueva Directora y gana{" "}
                    <b>+{dinero(CONFIG.bonoFormacion)}*</b>
                  </span>
                </span>
                <span className="anuncio__circulo">
                  <img src={graduada} alt="" />
                </span>
              </button>
            )}
          </div>
          {conBannerCarrera && (
            <NotaLegal tipo="ganancia" className="anuncios__legal" />
          )}
          {conBannerBono && (
            <NotaLegal tipo="bono" className="anuncios__legal" />
          )}
        </section>
      )}

      <footer className="pie">
        <img src={isotipo} alt="" width={24} height={24} />
        <p>UNIQUE S.A.&nbsp;&nbsp;|&nbsp;&nbsp;20100102413</p>
        <p className="pie__enlaces">
          <u>Política de Privacidad</u>
          <u>Términos de servicio</u>
        </p>
        <p>©2026 Yanbal&nbsp;&nbsp;|&nbsp;&nbsp;Versión v1.0</p>
      </footer>
    </>
  );
}
