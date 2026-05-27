import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';
import QuestionVisual, { PatternFrame } from '../components/QuestionVisual';

// ── Question Bank (from spreadsheet columns B, C, D) ─────────────────────────

const QUESTION_BANK = {
  mathematics: {
    label: 'Mathematics', icon: '🔢', color: '#4338CA', lightBg: '#EEF2FF',
    topics: [
      {
        key: 'number', label: 'Numbers', questionTypes: [
          { key: 'counting', label: 'Counting', examples: ['Is 45 even or odd?', 'Arrange 373, 678 and 145 from smallest to largest', 'What is the largest number you can make with 3, 8, 4, 5?', 'Write 50,434 in words', 'Write 1,500,434 in words'] },
          { key: 'placevalue', label: 'Place Value', examples: ['What does the 3 represent in 3,770?', 'What does the 3 represent in 3,129,400?'] },
          { key: 'greaterthan', label: 'Greater Than / Less Than', examples: ['Which number is greater, 114 or 259?', 'Complete: 36 _ 56 with > or <', 'Which is the smallest number? 328, 400, 342', 'Which is the largest number? 5349, 6412, 2362'] },
          { key: 'rounding', label: 'Rounding', examples: ['Round 89 to the nearest tens', 'Round 789 to the nearest hundred', 'Round 17,895 to the nearest thousand'] },
          { key: 'wordednumber', label: 'Worded Number Problems', examples: ['Sam has 4 cards: 3, 7, 6, 2. What is the biggest odd number he can form?', 'What is 63 more than 8 tens and 42 ones?'] },
        ]
      },
      {
        key: 'addition', label: 'Addition', questionTypes: [
          { key: 'adddigits', label: 'Adding Digits', examples: ['3 + 2 = ?', '14 + 42 = ?', '104 + 402 = ?', '3,362 + 4,203 = ?', 'What is the sum of 2,362 and 3,621?'] },
          { key: 'addworded1', label: 'Worded Addition (Basic)', examples: ['Rachel has 10 oranges and Thomas has 12. How many together?', '120 kids went Monday. 145 more went Tuesday. How many more on Tuesday?'] },
          { key: 'addworded2', label: 'Worded Addition (Multi-step)', examples: ['Group A made 364 sandcastles. Group B made 25 more. How many did Group B make?', 'Tom earned $600. He spent $485 on Monday and $30 on Tuesday. How much left?', 'It takes 6 mins to bake cookies and 5 mins for chocolate chips. How long for 8 cookies and 4 chocolate chips?'] },
        ]
      },
      {
        key: 'subtraction', label: 'Subtraction', questionTypes: [
          { key: 'subdigits', label: 'Subtracting Digits', examples: ['5 - 2 = ?', '50 - 2 = ?', '378 - 204 = ?', '5,362 - 4,203 = ?', '100 - 5 = ?', '3,500 - 421 = ?'] },
          { key: 'subworded1', label: 'Worded Subtraction (Basic)', examples: ['Max bought 20 balls. If 4 were blue, how many were red?', 'Matthew had 30 lollies. He gave 5 to William. How many left?', 'Olivia bought 421 cups and Archie bought 124. What is the difference?'] },
          { key: 'subworded2', label: 'Worded Subtraction (Multi-step)', examples: ['I had 300 books. I took out 45 then 30. How many left?', 'I had 400 pizzas. I sell 30 per hour. How many left after 4 hours?', 'Peter has 120, David has 55, Sam has 90. Take 30 from each. How many altogether?'] },
        ]
      },
      {
        key: 'multiplication', label: 'Multiplication', questionTypes: [
          { key: 'multdigits', label: 'Multiplying Digits', examples: ['2 x 2 = ?', '32 x 4 = ?', '42 x 68 = ?', '350 x 20 = ?', '2364 x 3 = ?', '2364 x 10 = ?'] },
          { key: 'multgroups', label: 'Counting Groups', examples: ['What is 3 groups of 2?', 'What is 10 groups of 4?'] },
          { key: 'multest', label: 'Estimate Multiplication', examples: ['Estimate 259 x 50', 'Estimate 312 x 19'] },
          { key: 'multworded', label: 'Worded Multiplication', examples: ['4 rows with 3 books each. How many books?', 'David earns $20 per week. How much after 5 weeks?', '15 boys and 16 girls in each of 4 classes. How many students total?', '5 boxes of 20 balls. Remove 2 from each box. How many total?'] },
        ]
      },
      {
        key: 'division', label: 'Division', questionTypes: [
          { key: 'divgroups', label: 'Counting Groups', examples: ['Put 10 balls into 5 bags. How many in each bag?', 'John had 20 toys and gave them equally to 5 friends. How many each?'] },
          { key: 'divdigits', label: 'Dividing Digits', examples: ['18 / 2 = ?', 'Divide 15 by 4 — what is the remainder?', '2555 / 5 = ?', '482 / 3 — what is the remainder?'] },
        ]
      },
      {
        key: 'fractions', label: 'Fractions', questionTypes: [
          { key: 'fraccount', label: 'Count Fractions', examples: ['A table has 4 columns, 2 are coloured. What fraction?', 'What fraction of the circle is shaded?'] },
          { key: 'fraccompare', label: 'Compare Fractions', examples: ['Which fraction is larger: 2/4 or 3/4?', 'Compare 3/5 and 2/5 with > or <', 'Put in order: 3/8, 2/8, 6/8'] },
          { key: 'fracaddub', label: 'Add / Subtract Fractions', examples: ['2/5 + 1/5 = ?', '3/6 + 1/6 = ?', '45/100 + 32/100 = ?', '2 3/4 + 3 1/4 = ?'] },
          { key: 'fracmult', label: 'Multiply Fractions', examples: ['2/4 x 3/5 = ?', '5/6 x 10 = ?'] },
          { key: 'fracdiv', label: 'Divide Fractions', examples: ['5 / (1/2) = ?', '(1/5) / (2/3) = ?'] },
          { key: 'fracworded', label: 'Worded Fraction Problems', examples: ['David had a pizza 8/8. He ate 3/8 slices. How many left?', 'A bag has 20 marbles. 1/4 are red. How many red?'] },
        ]
      },
      {
        key: 'decimal', label: 'Decimals', questionTypes: [
          { key: 'deccount', label: 'Count / Write Decimals', examples: ['Write in number form: twenty five point three', 'Write 1/2 as a decimal', 'Write 1 3/4 as a decimal', 'Write 3.75 as a mixed fraction', 'Write 58/100 as a decimal'] },
          { key: 'decaddub', label: 'Add / Subtract Decimals', examples: ['5 - 0.75 = ?', '12.50 - 6.5 = ?', '720.50 - 365.25 = ?'] },
          { key: 'deccompare', label: 'Compare Decimals', examples: ['Which is larger: 45.421 or 45.4215?', 'Put in order: 3.53, 1.55, 6.39, 2.01', 'Put in order: 1.5, 1.05, 1.15, 1.51'] },
          { key: 'decmult', label: 'Multiply Decimals', examples: ['0.25 x 4 = ?', '1.5 x 3 = ?'] },
        ]
      },
      {
        key: 'percentage', label: 'Percentages', questionTypes: [
          { key: 'pctcount', label: 'Count Percentages', examples: ['Write 25/100 as a percentage', 'Write 0.25 as a percentage', 'Write 25% as a decimal'] },
          { key: 'pctcalc', label: 'Calculate Percentages', examples: ['What is 50% of $40?', '500 kids in school. 45% are boys. How many boys?'] },
          { key: 'pctworded', label: 'Worded Percentage Problems', examples: ['A computer costs $500 on 25% sale. What is the new price?', 'A holiday costs $370 with a 10% fee. How much is the fee?', 'Archie invests $1,000 at 10% per year. Total after 2 years?'] },
        ]
      },
      {
        key: 'conversion', label: 'Conversion', questionTypes: [
          { key: 'convlength', label: 'Length Conversion', examples: ['What is 300cm in metres?', 'What is 5 metres in cm?', 'What is 3,000m in km?', 'What is 5km in metres?'] },
          { key: 'convtime', label: 'Time Conversion', examples: ['How many minutes in 3 hours?', 'How many hours and minutes is 130 minutes?', 'How many seconds in 3 minutes?'] },
          { key: 'convmoney', label: 'Money Conversion', examples: ['How many cents in $3.00?', 'How many dollars in 300 cents?'] },
          { key: 'convweight', label: 'Weight / Mass Conversion', examples: ['How many grams in 3kg?', 'How many kg in 3,000g?', 'How many millilitres in 3 litres?', 'How many litres in 2,000ml?'] },
        ]
      },
      {
        key: 'money', label: 'Money', questionTypes: [
          { key: 'moneycount', label: 'Count Money', examples: ['Look at the coins — how much in total?', 'Look at the notes — how much in total?', 'What is $0.20 + $1?', 'What is $5 - $2?', 'What is $2.50 + $3.25?'] },
          { key: 'moneyworded', label: 'Worded Money Problems', examples: ['Adam had $50 and bought chips for $10. How much left?', 'Sally had $10, bought 2 chips for $1 each and 3 lollies for $0.50 each. How much left?', 'Sam buys a drink for $5. Chips cost $3 more. How much are the chips?'] },
        ]
      },
      {
        key: 'time', label: 'Time', questionTypes: [
          { key: 'timeclock', label: 'Read a Clock', examples: ['What time is shown on the clock?', 'What time is half past 9?', 'What time is quarter to 4?'] },
          { key: 'timecalc', label: 'Time Calculations', examples: ['A TV show started at 8:00pm and finished at 9:00pm. How long?', 'Jake took 3hrs to walk home. He arrived at 5pm. What time did he start?', 'Adrian started at 7pm and studied for 1hr 25min. What time did he finish?'] },
          { key: 'timecalendar', label: 'Calendar Problems', examples: ['What day is it 5 days after 3rd May?', 'How many days between 14 March and 2 April?'] },
        ]
      },
      {
        key: 'length', label: 'Length', questionTypes: [
          { key: 'lengthmeasure', label: 'Measure Length', examples: ['What is the length of the object?', 'Which object is the largest?', 'Which object is the smallest?'] },
          { key: 'lengthworded', label: 'Worded Length Problems', examples: ['Peter is taller than Thai by 20cm. Thai is 100cm. How tall is Peter?', 'Dan had 5m of rope and cut 2m off. How much left?', 'Anthony is 120m from the finish. Sally is 250m from the start on a 500m track. Who is ahead?'] },
        ]
      },
      {
        key: 'volume', label: 'Volume & Weight', questionTypes: [
          { key: 'volumecount', label: 'Count Volume / Weight', examples: ['Look at the objects — how many kg total?', 'Look at the objects — how many grams total?'] },
          { key: 'volumeworded', label: 'Worded Volume Problems', examples: ['Lia had 5kg of rice and gave 2.5kg away. How much left?', 'A tank holds 200 litres. It is 3/4 full. How many litres inside?'] },
        ]
      },
      {
        key: 'perimeter', label: 'Perimeter', questionTypes: [
          { key: 'perimmeasure', label: 'Measure Perimeter', examples: ['What is the perimeter of this shape?', 'A shape with 12cm length and 4cm width — what is the perimeter?'] },
          { key: 'perimworded', label: 'Worded Perimeter Problems', examples: ['A shape has 20cm length and 5cm width. What is the perimeter?', 'A rectangle has perimeter 40, with length 15. What is the width?'] },
        ]
      },
      {
        key: 'area', label: 'Area', questionTypes: [
          { key: 'areameasure', label: 'Measure Area', examples: ['What is the area of a 12cm x 4cm rectangle?', 'What is the area of the triangle?'] },
          { key: 'areacubes', label: 'Cube Volume', examples: ['How many cubes are in this object?', 'What is the volume of the cube (length x width x height)?'] },
          { key: 'areacomplex', label: 'Complex Area', examples: ['What is the area after removing the small square from the rectangle?', 'Calculate the total area of the combined shapes'] },
        ]
      },
      {
        key: 'angles', label: 'Angles', questionTypes: [
          { key: 'anglesbasic', label: 'Read / Calculate Angles', examples: ['What angle is shown?', 'What is angle x in the figure?', 'What is angle x in the triangle with angles 65 and 70 degrees?'] },
          { key: 'anglesshapes', label: 'Angles in Shapes', examples: ['What is the angle in an isosceles triangle?', 'What is the angle in a parallelogram?', 'What is the angle in a rhombus?', 'What is the angle in a trapezium?'] },
        ]
      },
      {
        key: 'factors', label: 'Factors & Multiples', questionTypes: [
          { key: 'factorscount', label: 'Count Factors & Multiples', examples: ['Is 3 a factor of 27?', 'What is a factor of 20?', 'What is a common factor of 30 and 20?', 'Which of 20, 15, 30, 65, 72 is NOT a factor of 5?', 'What is a common multiple of 21 and 3?'] },
        ]
      },
      {
        key: 'rate', label: 'Rates', questionTypes: [
          { key: 'ratecount', label: 'Rate Problems', examples: ['A car drove for 3 hrs at 2km/h. How far?', 'A person earns $25/hour and works 8 hours. How much?'] },
        ]
      },
      {
        key: 'average', label: 'Averages', questionTypes: [
          { key: 'avgcount', label: 'Count Averages', examples: ['What is the average of 20, 42, 3, 14?'] },
          { key: 'avgworded', label: 'Worded Average Problems', examples: ['A class got 40, 30, 20, 55 out of 100. What is the average?'] },
        ]
      },
      {
        key: 'circle', label: 'Circles', questionTypes: [
          { key: 'circlecirc', label: 'Circumference', examples: ['A circle has diameter 10cm. What is its circumference? (Use pi = 3.14)', 'Calculate the circumference of a circle with radius 7cm'] },
          { key: 'circledia', label: 'Diameter & Radius', examples: ['Calculate the diameter of this circle', 'A circle has circumference 31.4cm. What is the diameter?'] },
        ]
      },
      {
        key: 'charts', label: 'Charts & Data', questionTypes: [
          { key: 'barchart', label: 'Bar Charts', examples: ['How many are in column A and B?', 'What is the greatest number in the chart?', 'How many more are in column C than A?', 'What is the total across all columns?', 'What could the title of this chart be?'] },
          { key: 'piechart', label: 'Pie Charts / Percentages', examples: ['Look at the pie chart — how much % was category 2?', 'What fraction prefers soccer?', 'If 200 students surveyed, how many prefer cricket?'] },
          { key: 'thermometer', label: 'Thermometer', examples: ['Look at the thermometer — what is the temperature in Celsius?', 'Look at the thermometer — what is the temperature in Fahrenheit?'] },
        ]
      },
      {
        key: 'algebra', label: 'Algebra', questionTypes: [
          { key: 'algcalc', label: 'Calculate Algebra', examples: ['5k = 5 x ?', 'Simplify b + b + b', 'Write an algebraic formula for: a number plus 10', 'Find the value of (y + 2) x 3 when y = 3'] },
          { key: 'algsolve', label: 'Solve for x', examples: ['5x = 35, find x', '3x + 7 = 22, find x'] },
        ]
      },
      {
        key: 'geometry', label: 'Shapes', questionTypes: [
          { key: 'geo2d', label: '2D Shapes', examples: ['What is the name of this shape?', 'How many sides does this shape have?', 'How many corners does this shape have?'] },
          { key: 'geo3d', label: '3D Shapes', examples: ['How many edges does this shape have?', 'How many faces does this shape have?', 'How many vertices does this shape have?'] },
          { key: 'geoflip', label: 'Flip / Rotate Shapes', examples: ['Look at this shape and flip it sideways', 'Look at this shape and rotate it 90 degrees'] },
        ]
      },
    ]
  },
  reading: {
    label: 'Reading Comprehension', icon: '📖', color: '#059669', lightBg: '#ECFDF5',
    topics: [
      {
        key: 'comprehension', label: 'Reading Comprehension', questionTypes: [
          { key: 'literal', label: 'Literal Comprehension', examples: ['According to the passage, what did the author do first?', 'What time did the event take place?'] },
          { key: 'inference', label: 'Inference & Implied Meaning', examples: ["What can you infer about the character's feelings?", 'Why did the author include this detail?'] },
          { key: 'vocabulary', label: 'Vocabulary in Context', examples: ['The word "enormous" most closely means...', 'What is the best synonym for "reluctant" in paragraph 2?'] },
          { key: 'mainidea', label: 'Main Idea & Summary', examples: ['What is the main idea of the passage?', 'Which title best summarises the passage?'] },
          { key: 'purpose', label: "Author's Purpose & Tone", examples: ["What is the author's main purpose?", 'What is the overall tone of the passage?'] },
        ]
      }
    ]
  },
  general: {
    label: 'General Ability', icon: '🧩', color: '#F97316', lightBg: '#FFF7ED',
    topics: [
      {
        key: 'patterns', label: 'Number Patterns', questionTypes: [
          { key: 'countby', label: 'Count On / Back Sequences', examples: ['Count on by ones: 525, 526, 527, ___?', 'Count on by tens: 717, 727, 737, ___?', 'Count on by hundreds: 380, 480, 580, ___?', 'Count on by thousands: 3800, 4800, 5800, ___?', 'Count on by ten thousands: 30800, 40800, 50800, ___?'] },
          { key: 'missingnum', label: 'Fill in Missing Numbers (Equal steps)', examples: ['436, 438, ___, 442, ___, 446', '5236, 5238, ___, 5242, ___, 5246', '10,000, 20,000, ___, 40,000'] },
          { key: 'doubtriple', label: 'Doubling / Tripling Patterns', examples: ['Fill in: 1, 2, 4, 8, 16, ___', '3, 6, 12, 24, ___?', '2, 6, 18, 54, ___?'] },
          { key: 'mixedpattern', label: 'Mixed Addition & Subtraction Patterns', examples: ['Fill in: 2, 4, 3, 5, 4, 6, ___', '1, 3, 2, 4, 3, 5, ___', '10, 8, 11, 9, 12, 10, ___'] },
        ]
      },
      {
        key: 'picturepatterns', label: 'Picture Patterns', questionTypes: [
          { key: 'shaperotate', label: 'Rotation / Direction Patterns', examples: ['Arrow pointing right, down, right, down — what comes next?', 'Shape rotating 90° each step — what is the next position?'] },
          { key: 'shapefill', label: 'Fill / Shading Patterns', examples: ['Hollow triangle, half-filled, solid — what comes next?', 'Circle with increasing rings — what is the 5th in the sequence?'] },
          { key: 'shapecount', label: 'Count Patterns', examples: ['1 circle, 2 circles, 3 circles — what comes next?', 'Pattern adds one star each step — what is the 4th frame?'] },
          { key: 'shapealt', label: 'Alternating Shape Patterns', examples: ['Triangle, circle, triangle, circle — what comes next?', 'Square, star, square, star — what is the missing frame?'] },
          { key: 'shapematrix', label: 'Shape Matrix (Odd One Out)', examples: ['Which box does not fit the pattern?', 'Find the shape that breaks the sequence rule'] },
        ]
      },
      {
        key: 'verbal', label: 'Verbal Reasoning', questionTypes: [
          { key: 'analogies', label: 'Word Analogies', examples: ['Hot is to cold as day is to ___?', 'Doctor is to hospital as teacher is to ___?', 'Circle is to round as square is to ___?'] },
          { key: 'oddoneout', label: 'Odd One Out', examples: ['Find the odd word: apple, orange, banana, hammer, grape', 'Find the odd word: cat, dog, bird, rose, fish'] },
          { key: 'synonyms', label: 'Synonyms', examples: ['What is a synonym for "happy"?', 'What is a synonym for "large"?', 'What is a synonym for "quick"?'] },
          { key: 'antonyms', label: 'Antonyms', examples: ['What is an antonym for "cold"?', 'What is an antonym for "brave"?', 'What is an antonym for "ancient"?'] },
          { key: 'letters', label: 'Letter Patterns', examples: ['A, C, E, G, ___?', 'Z, X, V, T, ___?', 'A, B, D, G, K, ___?'] },
        ]
      },
      {
        key: 'logic', label: 'Logic & Reasoning', questionTypes: [
          { key: 'deduction', label: 'Draw Conclusions', examples: ['All boys in the park play soccer. Half also play ping pong. Half the ping pong players are girls. What can we conclude?', 'Sam is better than Richard at Maths. Richard is good at English. Ben sometimes beats Sam at dancing. What can we conclude?'] },
          { key: 'findinfo', label: 'Find Information in Text', examples: ['Car A is 4m long. Car B is 2.5m. Car C is 1m longer than A. Car D is double B. Which is longest?', 'Student A got 87, B got 95, C got half of B, D got 10 more than A. Who got the highest?'] },
          { key: 'ordering', label: 'Order Steps / Instructions', examples: ['Order the steps to make tea: Boil water, Pour into cup, Stir, Add milk, Drink', 'Order the steps to make a sandwich'] },
          { key: 'coding', label: 'Coding & Decoding', examples: ['If A=1, B=2, C=3 etc, what is the code for 10, 14, 13, 5, 6?', 'If A=1 and B=2, what word is 8-5-12-12-15?'] },
        ]
      },
    ]
  },
};

const STORAGE_KEY = 'scholarprep_custom_tests';
const loadSavedTests = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const saveTests = (t) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { } };
const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const btnStyle = { width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const smallBtnStyle = { width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' };

function ExitDialog({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚪</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Exit test?</div>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Your progress will not be saved.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Keep going</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Exit test</button>
        </div>
      </div>
    </div>
  );
}

function PauseOverlay({ onResume }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏸</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 28 }}>Test paused</div>
        <button onClick={onResume} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Resume →</button>
      </div>
    </div>
  );
}

function BuilderScreen({ onStart, onSaveAndStart, onSaveOnly, editingTest }) {
  const [selection, setSelection] = useState(editingTest?.selection || {});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedQTypes, setExpandedQTypes] = useState({});
  const [timerSecs, setTimerSecs] = useState(editingTest?.timerSecs || 0);
  const [reviewMode, setReviewMode] = useState(editingTest?.reviewMode || 'each');
  const [testName, setTestName] = useState(editingTest?.name || '');
  const [focused, setFocused] = useState('');
  const [passages, setPassages] = useState(editingTest?.passages || 2);
  const [questionsPerPassage, setQuestionsPerPassage] = useState(editingTest?.questionsPerPassage || 5);

  const getTotalForSubject = (sk) => {
    if (sk === 'reading') return Object.keys(selection.reading || {}).length > 0 ? passages * questionsPerPassage : 0;
    const s = selection[sk] || {};
    return Object.values(s).reduce((sum, t) => sum + Object.values(t).reduce((a, n) => a + n, 0), 0);
  }; const totalQuestions = Object.keys(QUESTION_BANK).reduce((sum, sk) => sum + getTotalForSubject(sk), 0);

  const setQtCount = (sk, tk, qtk, count) => setSelection(prev => ({
    ...prev, [sk]: { ...prev[sk], [tk]: { ...(prev[sk]?.[tk] || {}), [qtk]: Math.max(0, count) } }
  }));
  const getQtCount = (sk, tk, qtk) => selection[sk]?.[tk]?.[qtk] || 0;
  const getTopicTotal = (sk, tk) => Object.values(selection[sk]?.[tk] || {}).reduce((s, n) => s + n, 0);
  const toggleReading = () => setSelection(prev => prev.reading ? (({ reading, ...r }) => r)(prev) : { ...prev, reading: { comprehension: { mixed: 1 } } });
  const isReadingSelected = !!selection.reading;

  const buildConfig = () => ({
    id: editingTest?.id || Date.now().toString(),
    name: testName.trim(),
    selection, passages, questionsPerPassage, timerSecs, reviewMode, totalQuestions,
    createdAt: editingTest?.createdAt || new Date().toISOString(),
  });

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: 32 }}>
      <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Build a custom test</h2>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
        Expand a subject, then a topic, then a question type to see examples and add questions. Mix subjects freely.
      </p>

      {Object.entries(QUESTION_BANK).map(([sk, subj]) => {
        const subjTotal = getTotalForSubject(sk);
        const isExp = expandedSubjects[sk];
        const isReading = sk === 'reading';
        return (
          <div key={sk} style={{ background: '#fff', borderRadius: 16, marginBottom: 10, border: `1.5px solid ${subjTotal > 0 ? subj.color : 'rgba(67,56,202,0.08)'}`, overflow: 'hidden' }}>
            <div onClick={() => setExpandedSubjects(p => ({ ...p, [sk]: !p[sk] }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', background: subjTotal > 0 ? subj.lightBg : '#fff' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: subj.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{subj.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{subj.label}</div>
                {subjTotal > 0 && <div style={{ fontSize: 12, color: subj.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{subjTotal} question{subjTotal !== 1 ? 's' : ''} selected</div>}
              </div>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{isExp ? '▼' : '▶'}</span>
            </div>

            {isExp && (
              <div style={{ borderTop: '1px solid rgba(67,56,202,0.06)', padding: '8px 0' }}>
                {isReading ? (
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <input type="checkbox" checked={isReadingSelected} onChange={toggleReading} style={{ width: 18, height: 18, accentColor: subj.color, cursor: 'pointer' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>Include reading passages in this test</span>
                    </div>
                    {isReadingSelected && (
                      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(5,150,105,0.15)' }}>
                        {[['Number of passages', passages, setPassages, 1, 5], ['Questions per passage', questionsPerPassage, setQuestionsPerPassage, 1, 10]].map(([label, val, setter, min, max], i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(5,150,105,0.1)' : 'none' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button onClick={() => setter(v => Math.max(min, v - 1))} style={btnStyle}>-</button>
                              <span style={{ fontSize: 14, fontWeight: 700, color: subj.color, minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{val}</span>
                              <button onClick={() => setter(v => Math.min(max, v + 1))} style={btnStyle}>+</button>
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: 10, fontSize: 12, color: subj.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{passages} x {questionsPerPassage} = {passages * questionsPerPassage} questions total</div>
                      </div>
                    )}
                  </div>
                ) : (
                  subj.topics.map(topic => {
                    const tTotal = getTopicTotal(sk, topic.key);
                    const tKey = `${sk}.${topic.key}`;
                    const isTExp = expandedTopics[tKey];
                    // Topic-level count (stored under special key '_topic')
                    const topicDirectCount = getQtCount(sk, topic.key, '_topic');
                    const topicQtCount = getTopicTotal(sk, topic.key) - topicDirectCount;
                    return (
                      <div key={topic.key} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        {/* Topic row — has expand AND topic-level +/- */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 10px 24px' }}>
                          <button onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))} style={{ fontSize: 10, color: isTExp ? subj.color : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}>{isTExp ? '▼' : '▶'}</button>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }} onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))}>{topic.label}</span>
                          {tTotal > 0 && <span style={{ fontSize: 12, color: subj.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginRight: 4 }}>({tTotal}q)</span>}
                          {/* Topic-level counter — picks any mix of question types */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount - 1)} style={smallBtnStyle}>-</button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: topicDirectCount > 0 ? subj.color : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{topicDirectCount}</span>
                            <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount + 1)} style={smallBtnStyle}>+</button>
                          </div>
                        </div>
                        {/* Topic-level hint */}
                        {!isTExp && topicDirectCount > 0 && (
                          <div style={{ fontSize: 11, color: '#94A3B8', paddingLeft: 48, paddingBottom: 6, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                            Mixed question types · expand to pick specific types
                          </div>
                        )}

                        {isTExp && (
                          <div style={{ background: '#F8FAFF', borderTop: '1px solid #EEF2FF', paddingBottom: 6 }}>
                            <div style={{ fontSize: 11, color: '#94A3B8', padding: '6px 20px 4px 48px', fontFamily: 'Inter, sans-serif' }}>
                              ↑ Use the counter above for any mix, or pick specific types below:
                            </div>
                            {topic.questionTypes.map(qt => {
                              const count = getQtCount(sk, topic.key, qt.key);
                              const exKey = `${sk}.${topic.key}.${qt.key}`;
                              const isExExp = expandedQTypes[exKey];
                              return (
                                <div key={qt.key} style={{ padding: '8px 20px 8px 48px', borderBottom: '1px solid #EEF2FF' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => setExpandedQTypes(p => ({ ...p, [exKey]: !p[exKey] }))} style={{ fontSize: 10, color: isExExp ? subj.color : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 14, flexShrink: 0 }}>{isExExp ? '▼' : '▶'}</button>
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: count > 0 ? 700 : 500, color: count > 0 ? subj.color : '#374151', fontFamily: 'Inter, sans-serif' }}>{qt.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <button onClick={() => setQtCount(sk, topic.key, qt.key, count - 1)} style={smallBtnStyle}>-</button>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? subj.color : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{count}</span>
                                      <button onClick={() => setQtCount(sk, topic.key, qt.key, count + 1)} style={smallBtnStyle}>+</button>
                                    </div>
                                  </div>
                                  {isExExp && qt.examples && (
                                    <div style={{ marginTop: 8, marginLeft: 22, background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #EEF2FF' }}>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Example questions:</div>
                                      {qt.examples.map((ex, i) => (
                                        <div key={i} style={{ fontSize: 12, color: '#374151', fontFamily: 'Inter, sans-serif', padding: '4px 0', borderBottom: i < qt.examples.length - 1 ? '1px solid #F3F4F6' : 'none', lineHeight: 1.5 }}>
                                          <span style={{ color: subj.color, fontWeight: 700, marginRight: 6 }}>Q.</span>{ex}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {totalQuestions > 0 && (
        <>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginTop: 4, marginBottom: 10, border: '1px solid rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Time limit</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ l: 'No timer', v: 0 }, { l: '10 min', v: 600 }, { l: '20 min', v: 1200 }, { l: '30 min', v: 1800 }, { l: '45 min', v: 2700 }, { l: '60 min', v: 3600 }].map(t => (
                <button key={t.v} onClick={() => setTimerSecs(t.v)} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: timerSecs === t.v ? '#0F172A' : '#F8F9FF', color: timerSecs === t.v ? '#fff' : '#64748B', border: timerSecs === t.v ? 'none' : '1.5px solid rgba(67,56,202,0.1)', fontFamily: 'Inter, sans-serif' }}>{t.l}</button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 10, border: '1px solid rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Answer review</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ key: 'each', icon: '💡', title: 'Review as I go', desc: 'See answer after each question.' }, { key: 'end', icon: '🏆', title: 'Exam mode', desc: 'See all answers at end only.' }].map(m => (
                <button key={m.key} onClick={() => setReviewMode(m.key)} style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${reviewMode === m.key ? '#4338CA' : '#E5E7EB'}`, background: reviewMode === m.key ? '#EEF2FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: reviewMode === m.key ? '#4338CA' : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 2 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
              Ready — {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} selected
            </div>
            <input value={testName} onChange={e => setTestName(e.target.value)} placeholder="Name this test (optional — to save and reuse later)" style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: `1.5px solid ${focused === 'name' ? '#4338CA' : '#E5E7EB'}`, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#0F172A', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onStart(buildConfig())} style={{ flex: '2 1 160px', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.25)' }}>
                Generate test now →
              </button>
              {testName.trim() && (
                <>
                  <button onClick={() => onSaveAndStart(buildConfig())} style={{ flex: '1 1 120px', padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Save & start</button>
                  <button onClick={() => onSaveOnly(buildConfig())} style={{ flex: '1 1 100px', padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Save only</button>
                </>
              )}
            </div>
            {!testName.trim() && <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Add a name above to also save this test for reuse</div>}
          </div>
        </>
      )}
      {totalQuestions === 0 && <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Expand a subject above to start adding questions</div>}
    </div>
  );
}

function SavedTestsList({ tests, onStart, onEdit, onDelete, onCreateNew }) {
  if (tests.length === 0) return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>No saved tests yet</div>
      <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Build a test now — or name it to save for later.</p>
      <button onClick={onCreateNew} style={{ padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)' }}>Build a test →</button>
    </div>
  );
  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>My saved tests</h2>
        <button onClick={onCreateNew} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Build a test</button>
      </div>
      {tests.map(test => {
        const subjectKeys = Object.keys(test.selection || {});
        return (
          <div key={test.id} style={{ background: '#fff', borderRadius: 16, padding: '16px 22px', marginBottom: 10, border: '1px solid rgba(67,56,202,0.08)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {subjectKeys.map(sk => <div key={sk} style={{ width: 36, height: 36, borderRadius: 10, background: QUESTION_BANK[sk]?.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{QUESTION_BANK[sk]?.icon}</div>)}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{test.name}</div>
              <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                {subjectKeys.map(sk => QUESTION_BANK[sk]?.label).join(' + ')} · {test.totalQuestions}q · {test.timerSecs > 0 ? `${Math.round(test.timerSecs / 60)} min` : 'No timer'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(test)} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Edit</button>
              <button onClick={() => onDelete(test.id)} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Delete</button>
              <button onClick={() => onStart(test)} style={{ padding: '7px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start →</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuizScreen({ test, yearLevel, onFinish, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [passageGroups, setPassageGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Generating your test');
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.timerSecs || 0);
  const [paused, setPaused] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [dots, setDots] = useState('');
  const finishedRef = useRef(false);

  useEffect(() => { const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500); return () => clearInterval(t); }, []);
  useEffect(() => { generateAllQuestions(); }, []);

  const generateAllQuestions = async () => {
    setLoading(true); setError(''); finishedRef.current = false;
    try {
      const allQs = [];
      const groups = [];
      const { selection, passages, questionsPerPassage } = test;
      for (const [sk, topicSel] of Object.entries(selection)) {
        if (sk === 'reading') {
          setLoadingMsg('Generating reading passages');
          for (let i = 0; i < passages; i++) {
            const data = await generateReadingQuestions(yearLevel, questionsPerPassage);
            groups.push(data);
          }
          allQs.push(...groups.flatMap(g => g.questions.map(q => ({ ...q, _subj: 'reading' }))));
          continue;
        }
        if (sk === 'general') {
          setLoadingMsg('Generating general ability questions');
          for (const [tk, qtSel] of Object.entries(topicSel)) {
            for (const [qtk, count] of Object.entries(qtSel)) {
              if (!count) continue;
              const tObj = QUESTION_BANK.general.topics.find(t => t.key === tk);
              const qtObj = tObj?.questionTypes.find(q => q.key === qtk);
              // _topic means no specific question type — let AI pick any from this topic
              const focusStr = qtk === '_topic'
                ? `${tObj?.label || tk} — any question type from this topic, vary the types`
                : qtObj ? `${tObj?.label} — ${qtObj.label}: ${qtObj.examples?.[0] || ''}` : null;
              const genQs = await generateGeneralAbilityQuestions(yearLevel, count, focusStr);
              allQs.push(...genQs.slice(0, count).map(q => ({ ...q, _subj: 'general', topic: tk })));
            }
          }
          continue;
        }
        if (sk === 'mathematics') {
          setLoadingMsg('Generating maths questions');
          for (const [tk, qtSel] of Object.entries(topicSel)) {
            for (const [qtk, count] of Object.entries(qtSel)) {
              if (!count) continue;
              const tObj2 = QUESTION_BANK.mathematics.topics.find(t => t.key === tk);
              const qtObj2 = tObj2?.questionTypes.find(q => q.key === qtk);
              // _topic means no specific question type — let AI pick any from this topic
              const focusStr2 = qtk === '_topic'
                ? `${tObj2?.label || tk} — any question type from this topic, vary the types`
                : qtObj2 ? `${tObj2?.label} - ${qtObj2.label}. Example: ${qtObj2.examples?.[0] || ''}` : null;
              const genQs2 = await generateMathsQuestions(yearLevel, count, focusStr2);
              allQs.push(...genQs2.slice(0, count).map(q => ({ ...q, _subj: 'mathematics', topic: tk })));
            }
          }
        }
      }
      setPassageGroups(groups);
      setQuestions(allQs);
      setLoading(false);
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !test.timerSecs || paused) return;
    const t = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { clearInterval(t); if (!finishedRef.current) handleFinish(); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(t);
  }, [loading, paused]);

  const handleFinish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    const total = questions.length;
    await saveTestResult('mathematics', yearLevel, correct, total, questions, selected);
    onFinish({ correct, total, score: Math.round((correct / total) * 100), questions, selected, passageGroups });
  }, [questions, selected, yearLevel, onFinish, passageGroups]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    if (test.reviewMode === 'each') setRevealed(r => ({ ...r, [current]: true }));
  };

  const q = questions[current];
  const qSubj = q?._subj || 'mathematics';
  const qColor = QUESTION_BANK[qSubj]?.color || '#4338CA';
  const passage = (() => {
    if (!passageGroups.length || qSubj !== 'reading') return null;
    return passageGroups[Math.floor(current / (test.questionsPerPassage || 5))]?.passage || null;
  })();
  const isFirstInPassage = qSubj === 'reading' && current % (test.questionsPerPassage || 5) === 0;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: '#0F172A' }}>{loadingMsg}{dots}</div>
      <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Creating fresh questions — 20-30 seconds</div>
      <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 16, color: '#0F172A', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>{error}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={generateAllQuestions} style={{ padding: '12px 28px', borderRadius: 100, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Try again</button>
        <button onClick={onExit} style={{ padding: '12px 28px', borderRadius: 100, background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Exit</button>
      </div>
    </div>
  );

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 32px' }}>
      {showExit && <ExitDialog onConfirm={onExit} onCancel={() => setShowExit(false)} />}
      {paused && <PauseOverlay onResume={() => setPaused(false)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{test.name || 'Custom Test'} · Q{current + 1}/{questions.length}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {test.timerSecs > 0 && <>
            <div style={{ background: timeLeft < 60 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 60 ? '#BE123C' : '#4338CA', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>⏱ {formatTime(timeLeft)}</div>
            <button onClick={() => setPaused(true)} style={{ padding: '6px 12px', borderRadius: 100, fontSize: 13, background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>⏸</button>
          </>}
          <button onClick={() => setShowExit(true)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Exit</button>
        </div>
      </div>
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: qColor, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {passage && isFirstInPassage && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, border: '1px solid rgba(5,150,105,0.15)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{passage.title}</div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </div>
      )}
      {passage && !isFirstInPassage && (
        <details style={{ marginBottom: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#059669', fontFamily: 'Inter, sans-serif' }}>📖 Show passage: {passage.title}</summary>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, marginTop: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </details>
      )}

      {q && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>{QUESTION_BANK[qSubj]?.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: qColor, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>{QUESTION_BANK[qSubj]?.label}</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 22, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
            {q.visual && <QuestionVisual visual={q.visual} />}
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0F172A', lineHeight: 1.7, marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>{q.question}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(q.options).map(([letter, text]) => {
                const isSel = selected[current] === letter;
                const isRev = revealed[current];
                const isCorr = q.correct === letter;
                const answerFrame = q.visual?.answerFrames?.[letter];
                let bg = '#F8F9FF', bdr = '1.5px solid rgba(67,56,202,0.1)', clr = '#334155';
                if (isRev) { if (isCorr) { bg = '#ECFDF5'; bdr = '1.5px solid #6EE7B7'; clr = '#059669'; } else if (isSel) { bg = '#FFF1F2'; bdr = '1.5px solid #FDA4AF'; clr = '#BE123C'; } }
                else if (isSel) { bg = '#EEF2FF'; bdr = `1.5px solid ${qColor}`; clr = qColor; }
                return (
                  <button key={letter} onClick={() => handleSelect(letter)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: answerFrame ? '8px 14px' : '11px 14px', borderRadius: 10, cursor: isRev ? 'default' : 'pointer', background: bg, border: bdr, color: clr, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: (isRev && isCorr) ? '#059669' : (isRev && isSel) ? '#BE123C' : isSel ? qColor : 'rgba(67,56,202,0.08)', color: (isRev && isCorr) || (isRev && isSel) || isSel ? '#fff' : '#64748B' }}>{letter}</div>
                    {answerFrame
                      ? <PatternFrame frame={answerFrame} size={52} selected={isSel} correct={isCorr} revealed={isRev} color={qColor} />
                      : <span style={{ fontSize: 14 }}>{text}</span>
                    }
                    {isRev && isCorr && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    {isRev && isSel && !isCorr && <span style={{ marginLeft: 'auto' }}>✗</span>}
                  </button>
                );
              })}
            </div>
            {revealed[current] && <div style={{ marginTop: 12, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 13, color: '#4338CA', lineHeight: 1.65, fontFamily: 'Inter, sans-serif', border: '1px solid #C7D2FE' }}>💡 {q.explanation}</div>}
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: '#4338CA', border: '1.5px solid rgba(67,56,202,0.2)', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>← Prev</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {questions.slice(0, Math.min(questions.length, 20)).map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', background: i === current ? qColor : (selected[i] && test.reviewMode !== 'end') ? (selected[i] === questions[i]?.correct ? '#059669' : '#F43F5E') : selected[i] ? '#94A3B8' : '#E2E8F0' }} />
          ))}
          {questions.length > 20 && <span style={{ fontSize: 11, color: '#94A3B8' }}>+{questions.length - 20}</span>}
        </div>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: qColor, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
          : <button onClick={handleFinish} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Finish ✓</button>
        }
      </div>
    </div>
  );
}

function ResultsScreen({ test, result, onRetry, onBack }) {
  const { correct, total, score, questions, selected } = result;
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)' }}>
        {test.name && <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>{test.name}</div>}
        <div style={{ fontSize: 64, fontWeight: 900, color: score >= 70 ? '#059669' : score >= 50 ? '#4338CA' : '#F97316', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{score}%</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>{correct} correct out of {total}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          <span style={{ fontSize: 14, color: '#059669', fontWeight: 700 }}>✓ {correct}</span>
          <span style={{ fontSize: 14, color: '#F43F5E', fontWeight: 700 }}>✗ {total - correct}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Question review</div>
      {questions.map((q, i) => {
        const ua = selected[i];
        const isCorrectQ = ua === q.correct;
        const qSubjR = q._subj || 'mathematics';
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 8, border: '1px solid rgba(67,56,202,0.06)', display: 'flex', gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: isCorrectQ ? '#ECFDF5' : '#FFF1F2', color: isCorrectQ ? '#059669' : '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{isCorrectQ ? '✓' : '✗'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: QUESTION_BANK[qSubjR]?.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: 3 }}>{QUESTION_BANK[qSubjR]?.icon} {QUESTION_BANK[qSubjR]?.label}</div>
              <div style={{ fontSize: 13, color: '#0F172A', marginBottom: 3, fontFamily: 'Inter, sans-serif' }}><strong>Q{i + 1}.</strong> {q.question}</div>
              {!isCorrectQ && <div style={{ fontSize: 12, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>You: <strong>{ua ? `${ua}. ${q.options[ua]}` : 'Not answered'}</strong></div>}
              <div style={{ fontSize: 12, color: '#059669', fontFamily: 'Inter, sans-serif' }}>Correct: <strong>{q.correct}. {q.options[q.correct]}</strong></div>
              {!isCorrectQ && q.explanation && <div style={{ marginTop: 6, fontSize: 12, color: '#64748B', background: '#EEF2FF', padding: '7px 10px', borderRadius: 8, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>💡 {q.explanation}</div>}
            </div>
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onBack} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back</button>
        <button onClick={onRetry} style={{ flex: 2, padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Redo this test →</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Results saved to Progress Dashboard</div>
    </div>
  );
}

export default function CustomTestPage() {
  const { yearLevel, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [savedTests, setSavedTests] = useState(loadSavedTests);
  const [editingTest, setEditingTest] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [result, setResult] = useState(null);

  const handleStart = (cfg) => { setActiveTest(cfg); setView('quiz'); };
  const handleSaveAndStart = (cfg) => {
    const updatedTests = editingTest ? savedTests.map(t => t.id === cfg.id ? cfg : t) : [...savedTests, cfg];
    setSavedTests(updatedTests); saveTests(updatedTests); setEditingTest(null); setActiveTest(cfg); setView('quiz');
  };
  const handleSaveOnly = (cfg) => {
    const updatedTests2 = editingTest ? savedTests.map(t => t.id === cfg.id ? cfg : t) : [...savedTests, cfg];
    setSavedTests(updatedTests2); saveTests(updatedTests2); setEditingTest(null); setView('list');
  };

  const isSaved = (test) => savedTests.some(t => t.id === test?.id);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Custom Tests</div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Build your own tests · Year {yearLevel}</div>
        </div>
        {view === 'builder' && <button onClick={() => { setEditingTest(null); setView('list'); }} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back</button>}
        {view === 'list' && <button onClick={() => { setEditingTest(null); setView('builder'); }} style={{ marginLeft: 'auto', padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Build a test</button>}
      </div>

      {!hasAccess && (
        <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid rgba(67,56,202,0.1)', boxShadow: '0 4px 24px rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Your free trial has ended</div>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Subscribe to build custom tests — just $9.99/month.</p>
            <button onClick={() => navigate('/subscribe')} style={{ width: '100%', padding: '15px', borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Subscribe for $9.99/month →</button>
          </div>
        </div>
      )}

      {hasAccess && view === 'list' && <SavedTestsList tests={savedTests} onStart={handleStart} onEdit={(t) => { setEditingTest(t); setView('builder'); }} onDelete={(id) => { const u = savedTests.filter(t => t.id !== id); setSavedTests(u); saveTests(u); }} onCreateNew={() => { setEditingTest(null); setView('builder'); }} />}
      {hasAccess && view === 'builder' && <BuilderScreen onStart={handleStart} onSaveAndStart={handleSaveAndStart} onSaveOnly={handleSaveOnly} editingTest={editingTest} />}
      {hasAccess && view === 'quiz' && activeTest && <QuizScreen test={activeTest} yearLevel={yearLevel} onFinish={(res) => { setResult(res); setView('results'); }} onExit={() => setView(isSaved(activeTest) ? 'list' : 'builder')} />}
      {hasAccess && view === 'results' && result && <ResultsScreen test={activeTest} result={result} onRetry={() => { setView('quiz'); }} onBack={() => setView(isSaved(activeTest) ? 'list' : 'builder')} />}
    </div>
  );
}