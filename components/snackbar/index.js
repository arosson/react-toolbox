import { themr } from '@shutterstock-libs/react-css-themr';
import { SNACKBAR } from '../identifiers';
import { snackbarFactory } from './Snackbar';
import { Button } from '../button';
import theme from './theme.css';

const ThemedSnackbar = themr(SNACKBAR, theme)(snackbarFactory(Button));

export default ThemedSnackbar;
export { ThemedSnackbar as Snackbar };
