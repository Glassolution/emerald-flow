import "./BouncingBallsLoader.css";

/**
 * Componente de loading com três bolinhas verdes quicando
 * As bolinhas quicam sequencialmente com um pequeno delay entre elas
 * Elas se achatam ao tocar o chão
 */
export function BouncingBallsLoader() {
  return (
    <div className="bouncing-balls-container">
      <div className="bouncing-balls">
        <div className="ball ball-1">
          <div className="shadow shadow-1"></div>
        </div>
        <div className="ball ball-2">
          <div className="shadow shadow-2"></div>
        </div>
        <div className="ball ball-3">
          <div className="shadow shadow-3"></div>
        </div>
      </div>
    </div>
  );
}
