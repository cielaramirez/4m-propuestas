import menu from '../assets/figma/home/menu.svg'
import logo from '../assets/figma/home/yanbal-logo.svg'
import bolsa from '../assets/figma/home/bag.svg'

/** Barra superior de Yanbal (menú, logo y bolsa). Sin acciones en esta demo. */
export function Cabecera() {
  return (
    <header className="cabecera">
      <img className="cabecera__menu" src={menu} alt="" />
      <img className="cabecera__logo" src={logo} alt="Yanbal" />
      <span className="cabecera__bolsa">
        <img src={bolsa} alt="" />0
      </span>
    </header>
  )
}
