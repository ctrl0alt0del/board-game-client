import React from 'react'

const THROW_DICE_TEXT = "Кинути кубики";
const REROLL_DICE_TEXT = "Перекинути";
const ACCEPT_RESULT_TEXT = "Прийняти Результат"

export const getCombatOverlayButtonText = (type: CombatOverlayControlButtons) => {
    switch (type) {
        case CombatOverlayControlButtons.ThrowDice: return THROW_DICE_TEXT;
        case CombatOverlayControlButtons.RerollDice: return REROLL_DICE_TEXT;
        case CombatOverlayControlButtons.AcceptResult: return ACCEPT_RESULT_TEXT;
        default: return '';
    }
}

export enum CombatOverlayControlButtons {
    None,
    ThrowDice,
    RerollDice,
    AcceptResult
}

export const CombatOvelayText = {
    INITIAL_TITLE_TEXT: "Бій",
    INITIAL_EXPL_TEXT: (
        <><p>Компанія Vault-Tec™ повідомляє, що ти щойно вступив в бій з ворогом. Щоб провести бій потрібно кинути кубики, які вирішать результат боя.</p>
            <p>Компанія Vault-Tec™ нагадує, що не несе ніякої відповідальність за: шкоду вчинену під час бою або після нього, непередбачуванну або передбачуванну смерть.</p> </>
    ),
    THROW_DICE_TITLE_TEXT: "Кидок Кубиків",
    THROW_DICE_EXPL_TEXT: <>
        <p>Три кубика V.A.T.S. використовуються при боях і перевірках. Кожна сторона кубика містить силует V.A.T.S. і може містити один або декілька значків <img src="/text/hit_icon.png" className="inline-image" />.</p>
        <p>Кожний силует V.A.T.S. складається з чотирьох частин: голова, туловище, руки і ноги. Кожна частина може бути або вразлива (зафарбована зеленим) або ні (чорним).</p>
        <p>*Компанія Vault-Tec™ рекомендує молитися на вдачу перед кожним кидком кубиків.</p>
    </>,
    REROLL_TITLE_TEXT: "Перекинути кубики",
    REROLL_EXPL_TEXT: <>
        <p>Ви можете один раз перекинути будь-яку кількість кубиків за кожний S.P.E.C.I.A.L.-жетонів, які у вас є і які вказані на ваші екіпіровній зброї.</p>
        <p>Компанія Vault-Tec™ наголошує, що не несе гарантій, що вам в цей раз "вже точно повезе".</p>
    </>,
    ACCEPT_RESULT_TITLE: "Завершення бою",
    ACCEPT_RESULT_EXPL_TEXT: <>
        <p>Вбивши ворога, ти отримаюєш досвід, рівний його рівню. Якщо ти не вбив ворога в бою, він залишається в тому ж секторі. Інші виживші можуть боротися з виздоровівшим ворогом.</p>
        <p>Компанія Vault-Tec™ запевняє, що після твоєї смерті в бою, усе твоє добро піде на "добрі справи".</p>
    </>
}