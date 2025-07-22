import React from 'react';
import { WordProcessorDemo } from '../components/word-processor-demo';
import { Navbar } from '../components/navbar';

export default function WordProcessorDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WordProcessorDemo />
    </div>
  );
}