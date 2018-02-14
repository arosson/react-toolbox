import { themr } from '@shutterstock-libs/react-css-themr';
import { OVERLAY } from '../identifiers';
import { Overlay } from './Overlay';
import theme from './theme.css';

const ThemedOverlay = themr(OVERLAY, theme)(Overlay);
export default ThemedOverlay;
export { ThemedOverlay as Overlay };
