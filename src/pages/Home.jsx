import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { MoodPicker } from '../components/MoodPicker';
import { TodoPanel } from '../components/TodoPanel';
import { StickyNotesTray, StickyNoteComposer } from '../components/StickyNotes';
import { PhotoWall } from '../components/PhotoWall';
import { JamSessions } from '../components/JamSessions';
import { TriggerPanel } from '../components/TriggerPanel';
import { FlipLetter } from '../components/FlipLetter';

export default function Home() {
  return (
    <DashboardLayout>
      {/* Absolute overlay stack mounted safely outside content flows */}
      <StickyNotesTray />

      <div className="h-full min-h-0 w-full overflow-hidden">
        <div className="flex h-full min-h-0 items-stretch justify-between gap-3 lg:gap-5 xl:gap-6 w-full">
          
          <div className="flex-1 flex flex-row min-w-0 min-h-0 h-full gap-3 lg:gap-5 xl:gap-8">
            <div
              className="
                h-full max-h-full min-w-[14rem] shrink
                w-[clamp(14rem,40%,100%)]
                md:w-[clamp(14rem,36%,42%)]
                lg:w-[45%] lg:max-w-[50%]
                xl:w-[48%] xl:max-w-[50%]
              "
            >
              <TodoPanel />
            </div>
            <div className="flex-1 min-w-0 h-full flex flex-col justify-end gap-3 lg:gap-5 xl:gap-6 min-h-0">
              <div className="flex flex-row gap-3 lg:gap-5 xl:gap-6 justify-between items-start min-h-0 flex-1 max-h-[58%]">
                <PhotoWall />
                <div className="shrink-0 self-start">
                  <StickyNoteComposer />
                </div>
              </div>
              <div className="shrink-0 min-h-0 max-h-[42%] overflow-hidden">
                <JamSessions />
              </div>
            </div>
          </div>

          <div className="w-auto shrink-0 h-full min-h-0 flex items-start justify-end">
            <FlipLetter />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}