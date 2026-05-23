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

      <div className="w-full">
        {/* Changed to flex layout with items-start to handle varying column heights */}
        <div className="flex items-start justify-between gap-6 w-full">
          
          {/* Main Content: Takes up all remaining available workspace width dynamically */}
          <div className="flex-1 flex flex-row max-h-[75vh] gap-8">
            <TodoPanel />
            <div className='w-5/6 h-auto flex flex-col justify-end gap-8 '>
              <div className='flex flex-row gap-6 justify-between items-start'>
                <PhotoWall />
                <StickyNoteComposer />
              </div>
              <JamSessions />
            </div>
          </div>

          {/* Interactive Flip-Letter Widget Column */}
          {/* w-auto lets it match its child's exact size, shrink-0 stops the browser from squishing it */}
          <div className="w-auto shrink-0 pt-0 flex justify-end">
            <FlipLetter />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}