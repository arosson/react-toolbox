import { themr } from 'react-css-themr';
import { DIALOG } from '../identifiers';
import { dialogFactory } from './Dialog';
import { innerDialogFactory } from './InnerDialog';
import { Overlay } from '../overlay';
import { Button } from '../button';
import theme from './theme.css';

const Dialog = dialogFactory(Overlay, Button);
const ThemedDialog = themr(DIALOG, theme)(Dialog);
const InnerDialog = innerDialogFactory(Button);
const ThemedInnerDialog = themr(DIALOG, theme)(InnerDialog);

export default ThemedDialog;
export { ThemedDialog as Dialog, ThemedInnerDialog as InnerDialog };
