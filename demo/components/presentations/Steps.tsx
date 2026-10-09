import { Children, HTMLAttributes, ReactNode, isValidElement } from 'react';
import { Fragment as Waiting } from '@revealjs/react';

export interface StepsProps {
  readonly children: ReactNode;
}

/**
 * Things said one after another, on one slide.
 *
 * A point made in three parts is one slide and not three: the heading stays put,
 * whatever stands beside it stays put, and the parts arrive as the speaker
 * reaches them. Written as three slides it reads the same to a room and quite
 * differently to anyone paging through it afterwards, who is made to hunt for
 * what changed between one slide and the next.
 *
 * A rule cuts one step from the next, as it cuts one slide from the next — the
 * same mark for the same work, a step down. So a step is everything between two
 * rules, however many blocks that runs to: a line introducing a list is saying
 * what the list says, and arrives with it.
 *
 *     <Steps>
 *
 *     What there is a great deal of:
 *
 *     - and what it is made of
 *
 *     ---
 *
 *     What is hard about it
 *
 *     </Steps>
 *
 * The first step is there on arrival — a slide that opens with nothing on it
 * says nothing — and every one after it waits for the reader to ask.
 */
export function Steps({ children }: StepsProps) {
  const steps = Children.toArray(children).filter(isValidElement);

  return (
    <div className="deck__steps">
      {steps.map((step, at) =>
        at === 0 ? (
          step
        ) : (
          <Waiting asChild key={step.key}>
            {step}
          </Waiting>
        )
      )}
    </div>
  );
}

export type StepProps = HTMLAttributes<HTMLDivElement>;

/**
 * One of them.
 *
 * No deck writes this: the build gathers what stands between two rules, so that
 * a deck says only where one step ends and never has to say what a step is.
 *
 * It takes whatever it is handed and wears it. A step that waits is marked as
 * waiting by the presenter, which does it by handing the step a class of its
 * own: a step that kept only its own would never be seen to wait.
 */
export function Step({ children, className, ...rest }: StepProps) {
  return (
    <div {...rest} className={className === undefined ? 'deck__step' : `deck__step ${className}`}>
      {children}
    </div>
  );
}
