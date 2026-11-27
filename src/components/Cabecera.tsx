import { useState } from 'react'
import { useDemo } from '../state/store'
import { MenuLateral } from './MenuLateral'
import menu from '../assets/figma/home/menu.svg'
import logo from '../assets/figma/home/yanbal-logo.svg'
import bolsa from '../assets/figma/home/bag.svg'

/** Barra superior de Yanbal (menú, logo y bolsa). El menú solo tiene contenido para la BDM. */
export function Cabecera() {
  const { perfil } = useDemo()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const conMenu = perfil.grupo === 'bdm'

  return (
    <header className="cabecera">
      {conMenu ? (
        <button className="cabecera__boton-menu" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú" aria-expanded={menuAbierto}>
          <img className="cabecera__menu" src={menu} alt="" />
        </button>
      ) : (
        <img className="cabecera__menu" src={menu} alt="" />
      )}
      <img className="cabecera__logo" src={logo} alt="Yanbal" />
      <span className="cabecera__bolsa">
        <img src={bolsa} alt="" />0
      </span>
      {menuAbierto && <MenuLateral onCerrar={() => setMenuAbierto(false)} />}
    </header>
  )
}
