import React from 'react';
import { Dialog } from './Dialog.component';
import { useInjector, useObservable, useText, useUANumberConjugation } from '../helpers/Hooks.utils';
import { PlayerCommunicatorImplementationService, DisplayRequestCapsDialogData } from '../../communicator-impl/PlayerCommunicatorImplementation.service';
import { DialogBody } from './DialogBody.component';
import { SourceDialogBody } from './SourceDialog.component';
import { LensUtils } from '../../../utils/lens/StateLens.utils';
import { GameEffectDisplayData } from '../../../game-logic/effects/Displayable.interface';
import { DialogButtonsLine, DialogButton } from './DialogButtons.component';

const useCommunicator = () => {
    const injector = useInjector();
    const communicator = injector.get(PlayerCommunicatorImplementationService);
    return { displayRequestCapsDialog: communicator.displayRequestCapsDialog, onRequestCapsResult: communicator.onRequestCapsResult }
}

const DisplaybleLens = LensUtils.keyPath<DisplayRequestCapsDialogData, GameEffectDisplayData>(['context', 'source', 'displayable'])

const TitleLens = LensUtils.compose(DisplaybleLens, LensUtils.key<GameEffectDisplayData, 'text'>('text'));
const ImageLens = LensUtils.compose(DisplaybleLens, LensUtils.key<GameEffectDisplayData, 'imageSrc'>('imageSrc'))


export const RequestCapsDialog: React.FC = props => {
    const { displayRequestCapsDialog, onRequestCapsResult } = useCommunicator();
    const data = useObservable(displayRequestCapsDialog);
    const capsCount = data ? data.value : 0;
    const title = TitleLens.get(data).orDefault('');
    const image = ImageLens.get(data).orDefault('');
    const reason = useText(data?.reasonText);
    const capsNounFactory = useUANumberConjugation({ one: 'кришку', upTo4: "кришки", many: "кришок" })
    return (
        <Dialog show={!!data}>
            <DialogBody>
                <SourceDialogBody title={title} image={image}>
                    Потратити {capsCount} {capsNounFactory(capsCount)}, щоб {reason}?
            </SourceDialogBody>
                <DialogButtonsLine>
                    <DialogButton text="Taк" onClick={()=>onRequestCapsResult.next(true)}/>
                    
                    <DialogButton text="Ні" onClick={()=>onRequestCapsResult.next(false)}/>
                </DialogButtonsLine>
            </DialogBody>
        </Dialog>
    )
}