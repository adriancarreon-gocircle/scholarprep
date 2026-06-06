import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions, generateEnglishQuestions } from '../lib/ai';
import { saveTestResult, saveCustomTemplate, getCustomTemplates, deleteCustomTemplate, syncCustomBuilderTests, loadCustomBuilderTests } from '../lib/progress';
import QuestionVisual, { PatternFrame } from '../components/QuestionVisual';

// ── Question Bank ─────────────────────────────────────────────────────────────

const QUESTION_BANK = {
  mathematics: {
    label: 'Mathematics', icon: '🔢', color: '#4338CA', lightBg: '#EEF2FF',
    topics: [
      { key: 'number', label: 'Numbers', questionTypes: [{ key: 'counting', label: 'Counting', examples: ['Is 45 even or odd?', 'Arrange 373, 678 and 145 from smallest to largest', 'What is the largest number you can make with 3, 8, 4, 5?', 'Write 50,434 in words', 'Write 1,500,434 in words'] }, { key: 'placevalue', label: 'Place Value', examples: ['What does the 3 represent in 3,770?', 'What does the 3 represent in 3,129,400?'] }, { key: 'greaterthan', label: 'Greater Than / Less Than', examples: ['Which number is greater, 114 or 259?', 'Complete: 36 _ 56 with > or <', 'Which is the smallest number? 328, 400, 342', 'Which is the largest number? 5349, 6412, 2362'] }, { key: 'rounding', label: 'Rounding', examples: ['Round 89 to the nearest tens', 'Round 789 to the nearest hundred', 'Round 17,895 to the nearest thousand'] }, { key: 'wordednumber', label: 'Worded Number Problems', examples: ['Sam has 4 cards: 3, 7, 6, 2. What is the biggest odd number he can form?', 'What is 63 more than 8 tens and 42 ones?'] }] },
      { key: 'addition', label: 'Addition', questionTypes: [{ key: 'adddigits', label: 'Adding Digits', examples: ['3 + 2 = ?', '14 + 42 = ?', '104 + 402 = ?', '3,362 + 4,203 = ?', 'What is the sum of 2,362 and 3,621?'] }, { key: 'addworded1', label: 'Worded Addition (Basic)', examples: ['Rachel has 10 oranges and Thomas has 12. How many together?', '120 kids went Monday. 145 more went Tuesday. How many more on Tuesday?'] }, { key: 'addworded2', label: 'Worded Addition (Multi-step)', examples: ['Group A made 364 sandcastles. Group B made 25 more. How many did Group B make?', 'Tom earned $600. He spent $485 on Monday and $30 on Tuesday. How much left?'] }] },
      { key: 'subtraction', label: 'Subtraction', questionTypes: [{ key: 'subdigits', label: 'Subtracting Digits', examples: ['5 - 2 = ?', '50 - 2 = ?', '378 - 204 = ?', '5,362 - 4,203 = ?', '100 - 5 = ?'] }, { key: 'subworded1', label: 'Worded Subtraction (Basic)', examples: ['Max bought 20 balls. If 4 were blue, how many were red?', 'Matthew had 30 lollies. He gave 5 to William. How many left?'] }, { key: 'subworded2', label: 'Worded Subtraction (Multi-step)', examples: ['I had 300 books. I took out 45 then 30. How many left?', 'I had 400 pizzas. I sell 30 per hour. How many left after 4 hours?'] }] },
      { key: 'multiplication', label: 'Multiplication', questionTypes: [{ key: 'multdigits', label: 'Multiplying Digits', examples: ['2 x 2 = ?', '32 x 4 = ?', '42 x 68 = ?', '350 x 20 = ?'] }, { key: 'multgroups', label: 'Counting Groups', examples: ['What is 3 groups of 2?', 'What is 10 groups of 4?'] }, { key: 'multest', label: 'Estimate Multiplication', examples: ['Estimate 259 x 50', 'Estimate 312 x 19'] }, { key: 'multworded', label: 'Worded Multiplication', examples: ['4 rows with 3 books each. How many books?', 'David earns $20 per week. How much after 5 weeks?'] }] },
      { key: 'division', label: 'Division', questionTypes: [{ key: 'divgroups', label: 'Counting Groups', examples: ['Put 10 balls into 5 bags. How many in each bag?', 'John had 20 toys and gave them equally to 5 friends. How many each?'] }, { key: 'divdigits', label: 'Dividing Digits', examples: ['18 / 2 = ?', 'Divide 15 by 4 — what is the remainder?', '2555 / 5 = ?'] }] },
      { key: 'fractions', label: 'Fractions', questionTypes: [{ key: 'fraccount', label: 'Count Fractions', examples: ['A table has 4 columns, 2 are coloured. What fraction?'] }, { key: 'fraccompare', label: 'Compare Fractions', examples: ['Which fraction is larger: 2/4 or 3/4?'] }, { key: 'fracaddub', label: 'Add / Subtract Fractions', examples: ['2/5 + 1/5 = ?', '3/6 + 1/6 = ?'] }, { key: 'fracmult', label: 'Multiply Fractions', examples: ['2/4 x 3/5 = ?'] }, { key: 'fracdiv', label: 'Divide Fractions', examples: ['5 / (1/2) = ?'] }, { key: 'fracworded', label: 'Worded Fraction Problems', examples: ['David had a pizza 8/8. He ate 3/8 slices. How many left?'] }] },
      { key: 'decimal', label: 'Decimals', questionTypes: [{ key: 'deccount', label: 'Count / Write Decimals', examples: ['Write in number form: twenty five point three', 'Write 1/2 as a decimal'] }, { key: 'decaddub', label: 'Add / Subtract Decimals', examples: ['5 - 0.75 = ?', '12.50 - 6.5 = ?'] }, { key: 'deccompare', label: 'Compare Decimals', examples: ['Which is larger: 45.421 or 45.4215?'] }, { key: 'decmult', label: 'Multiply Decimals', examples: ['0.25 x 4 = ?'] }] },
      { key: 'percentage', label: 'Percentages', questionTypes: [{ key: 'pctcount', label: 'Count Percentages', examples: ['Write 25/100 as a percentage', 'Write 0.25 as a percentage'] }, { key: 'pctcalc', label: 'Calculate Percentages', examples: ['What is 50% of $40?'] }, { key: 'pctworded', label: 'Worded Percentage Problems', examples: ['A computer costs $500 on 25% sale. What is the new price?'] }] },
      { key: 'conversion', label: 'Conversion', questionTypes: [{ key: 'convlength', label: 'Length Conversion', examples: ['What is 300cm in metres?'] }, { key: 'convtime', label: 'Time Conversion', examples: ['How many minutes in 3 hours?'] }, { key: 'convmoney', label: 'Money Conversion', examples: ['How many cents in $3.00?'] }, { key: 'convweight', label: 'Weight / Mass Conversion', examples: ['How many grams in 3kg?'] }] },
      { key: 'money', label: 'Money', questionTypes: [{ key: 'moneycount', label: 'Count Money', examples: ['Look at the coins — how much in total?'] }, { key: 'moneyworded', label: 'Worded Money Problems', examples: ['Adam had $50 and bought chips for $10. How much left?'] }] },
      { key: 'time', label: 'Time', questionTypes: [{ key: 'timeclock', label: 'Read a Clock', examples: ['What time is shown on the clock?'] }, { key: 'timecalc', label: 'Time Calculations', examples: ['A TV show started at 8:00pm and finished at 9:00pm. How long?'] }, { key: 'timecalendar', label: 'Calendar Problems', examples: ['What day is it 5 days after 3rd May?'] }] },
      { key: 'length', label: 'Length', questionTypes: [{ key: 'lengthmeasure', label: 'Measure Length', examples: ['What is the length of the object?'] }, { key: 'lengthworded', label: 'Worded Length Problems', examples: ['Peter is taller than Thai by 20cm. Thai is 100cm. How tall is Peter?'] }] },
      { key: 'volume', label: 'Volume & Weight', questionTypes: [{ key: 'volumecount', label: 'Count Volume / Weight', examples: ['Look at the objects — how many kg total?'] }, { key: 'volumeworded', label: 'Worded Volume Problems', examples: ['Lia had 5kg of rice and gave 2.5kg away. How much left?'] }] },
      { key: 'perimeter', label: 'Perimeter', questionTypes: [{ key: 'perimmeasure', label: 'Measure Perimeter', examples: ['What is the perimeter of this shape?'] }, { key: 'perimworded', label: 'Worded Perimeter Problems', examples: ['A shape has 20cm length and 5cm width. What is the perimeter?'] }] },
      { key: 'area', label: 'Area', questionTypes: [{ key: 'areameasure', label: 'Measure Area', examples: ['What is the area of a 12cm x 4cm rectangle?'] }, { key: 'areacubes', label: 'Cube Volume', examples: ['How many cubes are in this object?'] }, { key: 'areacomplex', label: 'Complex Area', examples: ['What is the area after removing the small square from the rectangle?'] }] },
      { key: 'angles', label: 'Angles', questionTypes: [{ key: 'anglesbasic', label: 'Read / Calculate Angles', examples: ['What angle is shown?', 'What is angle x in the triangle with angles 65 and 70 degrees?'] }, { key: 'anglesshapes', label: 'Angles in Shapes', examples: ['What is the angle in an isosceles triangle?'] }] },
      { key: 'factors', label: 'Factors & Multiples', questionTypes: [{ key: 'factorscount', label: 'Count Factors & Multiples', examples: ['Is 3 a factor of 27?', 'What is a factor of 20?', 'What is a common multiple of 21 and 3?'] }] },
      { key: 'rate', label: 'Rates', questionTypes: [{ key: 'ratecount', label: 'Rate Problems', examples: ['A car drove for 3 hrs at 2km/h. How far?', 'A person earns $25/hour and works 8 hours. How much?'] }] },
      { key: 'average', label: 'Averages', questionTypes: [{ key: 'avgcount', label: 'Count Averages', examples: ['What is the average of 20, 42, 3, 14?'] }, { key: 'avgworded', label: 'Worded Average Problems', examples: ['A class got 40, 30, 20, 55 out of 100. What is the average?'] }] },
      { key: 'circle', label: 'Circles', questionTypes: [{ key: 'circlecirc', label: 'Circumference', examples: ['A circle has diameter 10cm. What is its circumference? (Use pi = 3.14)'] }, { key: 'circledia', label: 'Diameter & Radius', examples: ['Calculate the diameter of this circle'] }] },
      { key: 'charts', label: 'Charts & Data', questionTypes: [{ key: 'barchart', label: 'Bar Charts', examples: ['How many are in column A and B?', 'What is the greatest number in the chart?'] }, { key: 'piechart', label: 'Pie Charts / Percentages', examples: ['Look at the pie chart — how much % was category 2?'] }, { key: 'thermometer', label: 'Thermometer', examples: ['Look at the thermometer — what is the temperature in Celsius?'] }] },
      { key: 'algebra', label: 'Algebra', questionTypes: [{ key: 'algcalc', label: 'Calculate Algebra', examples: ['5k = 5 x ?', 'Simplify b + b + b'] }, { key: 'algsolve', label: 'Solve for x', examples: ['5x = 35, find x', '3x + 7 = 22, find x'] }] },
      { key: 'geometry', label: 'Shapes', questionTypes: [{ key: 'geo2d', label: '2D Shapes', examples: ['What is the name of this shape?', 'How many sides does this shape have?'] }, { key: 'geo3d', label: '3D Shapes', examples: ['How many edges does this shape have?'] }, { key: 'geoflip', label: 'Flip / Rotate Shapes', examples: ['Look at this shape and flip it sideways'] }] },
    ]
  },
  reading: {
    label: 'Reading Comprehension', icon: '📖', color: '#059669', lightBg: '#ECFDF5',
    topics: [{ key: 'comprehension', label: 'Reading Comprehension', questionTypes: [{ key: 'literal', label: 'Literal Comprehension', examples: ['According to the passage, what did the author do first?'] }, { key: 'inference', label: 'Inference & Implied Meaning', examples: ["What can you infer about the character's feelings?"] }, { key: 'vocabulary', label: 'Vocabulary in Context', examples: ['The word "enormous" most closely means...'] }, { key: 'mainidea', label: 'Main Idea & Summary', examples: ['What is the main idea of the passage?'] }, { key: 'purpose', label: "Author's Purpose & Tone", examples: ["What is the author's main purpose?"] }] }]
  },
  english: {
    label: 'English', icon: '📝', color: '#7c3aed', lightBg: '#F5F3FF',
    topics: [
      { key: 'spelling', label: 'Spelling', questionTypes: [{ key: 'correctspell', label: 'Correct the spelling', examples: ['Which word is spelled incorrectly: "recieve", "believe", "achieve"?', 'Correct the spelling: "seperate"'] }, { key: 'choosespell', label: 'Choose the correct spelling', examples: ['Which is correct: "necessary" or "neccessary"?', 'Choose the correct spelling: "arguement" or "argument"?'] }, { key: 'fillinletters', label: 'Fill in the missing letters', examples: ['Fill in the blanks: b_l_ _ve', 'Complete the word: _ _ ceive (to get something)'] }] },
      { key: 'punctuation', label: 'Punctuation', questionTypes: [{ key: 'addpunct', label: 'Add the missing punctuation', examples: ['Where does a comma go: "I like cats dogs and birds"', 'Add punctuation: "Wow what a great day"'] }, { key: 'identerror', label: 'Identify the error', examples: ['Find the punctuation error in: "Its a beautiful day."', 'Which sentence has a punctuation error?'] }, { key: 'choosepunct', label: 'Choose the correctly punctuated sentence', examples: ['Which sentence is correct: A) "She said, hello." B) She said, "hello."'] }] },
      { key: 'capitals', label: 'Capital Letters', questionTypes: [{ key: 'wherecaps', label: 'Identify where capitals are needed', examples: ['Which word needs a capital: "monday", "apple", "run"?', 'Which sentence uses capitals correctly?'] }, { key: 'correctcaps', label: 'Correct the sentence', examples: ['Rewrite correctly: "i went to sydney on friday."'] }] },
      { key: 'plural', label: 'Plural', questionTypes: [{ key: 'writeplural', label: 'Write the plural', examples: ['What is the plural of "child"?', 'What is the plural of "mouse"?'] }, { key: 'chooseplural', label: 'Choose the correct plural', examples: ['Which is correct: "boxes" or "boxs"?'] }, { key: 'irregplural', label: 'Irregular plurals', examples: ['What is the plural of "goose"?', 'What is the plural of "tooth"?'] }] },
      { key: 'nouns', label: 'Nouns', questionTypes: [{ key: 'identnoun', label: 'Identify the noun', examples: ['Which word is the noun: "quickly", "dog", "ran"?'] }, { key: 'commonnoun', label: 'Common nouns', examples: ['Which is a common noun: "London", "city", "Mary"?'] }, { key: 'propernoun', label: 'Proper nouns', examples: ['Which word is a proper noun: "river", "Amazon", "large"?'] }, { key: 'collectivenoun', label: 'Collective nouns', examples: ['What is a group of lions called?', 'What is a group of fish called?'] }] },
      { key: 'adjectives', label: 'Adjectives', questionTypes: [{ key: 'identadj', label: 'Identify the adjective', examples: ['Which word is an adjective: "run", "beautiful", "slowly"?'] }, { key: 'adjphrase', label: 'Adjectival phrases', examples: ['Which phrase describes the noun: "the dog with the fluffy tail"?'] }, { key: 'compadj', label: 'Comparative adjectives', examples: ['What is the comparative form of "big"?', 'Which is correct: "more tall" or "taller"?'] }] },
      { key: 'verbs', label: 'Verbs', questionTypes: [{ key: 'identverb', label: 'Identify the verb', examples: ['Which word is a verb: "happy", "run", "blue"?'] }, { key: 'actionverb', label: 'Action verbs', examples: ['Which is an action verb: "seem", "jump", "become"?'] }, { key: 'helpverb', label: 'Helping/auxiliary verbs', examples: ['Which is the helping verb: "She is running."', 'Identify the auxiliary verb: "They have finished."'] }] },
      { key: 'adverbs', label: 'Adverbs', questionTypes: [{ key: 'identadv', label: 'Identify the adverb', examples: ['Which word is an adverb: "quickly", "cat", "green"?'] }, { key: 'advphrase', label: 'Adverbial phrases', examples: ['Which phrase tells us how: "in a hurry", "the red ball", "by the river"?'] }, { key: 'chooseadv', label: 'Choose the correct adverb', examples: ['Fill in: "She ran ___ to catch the bus." (quick/quickly)'] }] },
      { key: 'inged', label: 'Adding -ing and -ed', questionTypes: [{ key: 'addsuffix', label: 'Add the correct suffix', examples: ['Add -ing to "run": ___', 'Add -ed to "hop": ___'] }, { key: 'identingerr', label: 'Identify the error', examples: ['Find the error: "She was runing to the park."'] }, { key: 'doublerule', label: 'Doubling rule', examples: ['Why do we double the "p" in "stopped"?', 'Which is correct: "stoped" or "stopped"?'] }] },
      { key: 'ieei', label: 'ie and ei', questionTypes: [{ key: 'ieei_spell', label: 'Choose the correct spelling', examples: ['Which is correct: "recieve" or "receive"?', '"beleive" or "believe"?'] }, { key: 'ieei_fill', label: 'Fill in the blank', examples: ['Complete: bel_ _ve', 'Fill in: ach_ _ve'] }] },
      { key: 'tense', label: 'Tense', questionTypes: [{ key: 'present', label: 'Present tense', examples: ['Change to present tense: "She walked to school."', 'Which sentence is in present tense?'] }, { key: 'past', label: 'Past tense', examples: ['Change to past tense: "She walks to school."', 'What is the past tense of "go"?'] }, { key: 'future', label: 'Future tense', examples: ['Change to future tense: "She walks to school."'] }, { key: 'identtense', label: 'Identify the tense', examples: ['What tense is: "They will arrive tomorrow"?', 'Identify the tense: "We had eaten dinner."'] }] },
      { key: 'agreement', label: 'Subject-Verb Agreement', questionTypes: [{ key: 'chooseverb', label: 'Choose the correct verb form', examples: ['Fill in: "The dogs ___ (bark/barks) loudly."', '"She ___ (go/goes) to school."'] }, { key: 'correctagreement', label: 'Correct the sentence', examples: ['Fix: "The children was playing."', 'Correct: "He don\'t like carrots."'] }] },
      { key: 'endingy', label: 'Words ending in -y', questionTypes: [{ key: 'pluraly', label: 'Plural of words ending in -y', examples: ['What is the plural of "baby"?', 'What is the plural of "berry"?'] }, { key: 'suffixesy', label: 'Adding suffixes to -y words', examples: ['Add -ing to "fly": ___', 'Add -ed to "carry": ___'] }] },
      { key: 'homophones', label: 'Homophones', questionTypes: [{ key: 'choosehomophone', label: 'Choose the correct homophone', examples: ['Fill in: "I can ___ the bells." (hear/here)', '"She ___ (new/knew) the answer."'] }, { key: 'fillhomophone', label: 'Fill in the blank', examples: ['Use the correct word: "The cat wagged its ___." (tail/tale)'] }] },
      { key: 'days', label: 'Days, Months & Seasons', questionTypes: [{ key: 'spellingdays', label: 'Spelling of days/months', examples: ['Which is spelled correctly: "Febuary" or "February"?', '"Wenesday" or "Wednesday"?'] }, { key: 'capdays', label: 'Capitalisation rules', examples: ['Which needs a capital: "summer", "monday", "beach"?'] }] },
      { key: 'prepositions', label: 'Prepositions', questionTypes: [{ key: 'identprep', label: 'Identify the preposition', examples: ['Which word is a preposition: "run", "under", "happy"?'] }, { key: 'chooseprep', label: 'Choose the correct preposition', examples: ['Fill in: "The cat sat ___ the mat." (on/in/at)'] }, { key: 'prepphrase', label: 'Prepositional phrases', examples: ['Which is a prepositional phrase: "in the morning", "runs fast", "blue sky"?'] }] },
      { key: 'pronouns', label: 'Pronouns', questionTypes: [{ key: 'identpron', label: 'Identify the pronoun', examples: ['Which word is a pronoun: "she", "run", "big"?'] }, { key: 'subjobj', label: 'Subject vs object pronouns', examples: ['Which is correct: "Him and I went." or "He and I went."?'] }, { key: 'posspron', label: 'Possessive pronouns', examples: ['Which is correct: "Thats mine." or "That\'s mine."?', '"Is this yours or her\'s?"'] }] },
      { key: 'apostrophes', label: 'Apostrophes', questionTypes: [{ key: 'apostposs', label: 'Apostrophe for possession', examples: ['Add an apostrophe: "The dogs bone"', '"The childrens playground" — is this correct?'] }, { key: 'apostcontr', label: 'Apostrophe for contraction', examples: ['What is the contraction for "do not"?', 'Write the contraction for "they are"'] }, { key: 'correctapost', label: 'Correct the error', examples: ['Fix: "The cat licked it\'s paw." (possession vs contraction)'] }] },
      { key: 'sentenceorder', label: 'Sentence Order', questionTypes: [{ key: 'arrangewords', label: 'Arrange words into a correct sentence', examples: ['Arrange: "park / the / to / went / she" into a sentence', 'Put in order: "dog / big / the / ran / quickly"'] }, { key: 'arrangesentences', label: 'Arrange sentences into a correct paragraph', examples: ['Put these sentences in the correct order to make a paragraph about morning routines.'] }, { key: 'sequencesteps', label: 'Sequence the steps', examples: ['Steps for making toast are listed out of order. Which answer shows the correct sequence? (e.g. 2 – 4 – 3 – 1)', 'The steps for planting a seed are shuffled. Pick the correct order from the options.'] }] },
      { key: 'conjunctions', label: 'Conjunctions', questionTypes: [{ key: 'chooseconj', label: 'Choose the correct conjunction', examples: ['Fill in: "I like cats ___ I don\'t like dogs." (but/and/or)', '"She was tired, ___ she kept going." (but/so/because)'] }, { key: 'joinsentences', label: 'Join two sentences', examples: ['Join: "It was raining. She brought an umbrella." using a conjunction'] }] },
      { key: 'prefixsuffix', label: 'Prefixes & Suffixes', questionTypes: [{ key: 'identprefsuf', label: 'Identify the prefix/suffix', examples: ['What is the prefix in "unhappy"?', 'What is the suffix in "careful"?'] }, { key: 'chooseprefsuf', label: 'Choose the correct word with prefix/suffix', examples: ['Which prefix makes "possible" mean "not possible"? (un-/dis-/im-)'] }] },
      { key: 'synonymsantonyms', label: 'Synonyms & Antonyms', questionTypes: [{ key: 'choosesynonym', label: 'Choose the synonym', examples: ['What is a synonym for "happy"?', 'Which word means the same as "enormous"?'] }, { key: 'chooseantonym', label: 'Choose the antonym', examples: ['What is an antonym for "cold"?', 'Which word is the opposite of "ancient"?'] }] },
      { key: 'compound', label: 'Compound Words', questionTypes: [{ key: 'compoundwords', label: 'Identify/form compound words', examples: ['Which two words make a compound word: "sun" + ___?', 'What compound word uses "book" and "shelf"?'] }] },
      { key: 'figurative', label: 'Similes & Metaphors', questionTypes: [{ key: 'identfig', label: 'Identify the figure of speech', examples: ['Is "She runs like the wind" a simile or metaphor?', '"Life is a journey" — what figure of speech is this?'] }, { key: 'completesimile', label: 'Complete the simile', examples: ['Complete: "As brave as a ___"', 'Finish the simile: "She was as quiet as ___"'] }] },
      {
        key: 'factopinion', label: 'Fact or Opinion', questionTypes: [
          { key: 'isfact', label: 'Is this a fact or opinion?', examples: ['"The sky is blue." — fact or opinion?', '"Summer is the best season." — fact or opinion?'] },
          { key: 'identfact', label: 'Identify the fact', examples: ['Which is a fact: "Dogs are better pets" or "Dogs are mammals"?'] },
          { key: 'identopinion', label: 'Identify the opinion', examples: ['Which is an opinion: "Water boils at 100°C" or "Tea tastes better cold"?'] },
        ]
      },
      {
        key: 'perspective', label: 'Point of View', questionTypes: [
          { key: 'identpov', label: 'First, second or third person?', examples: ['"I went to the park." — what person?', '"You should try harder." — what person?', '"She loves reading." — what person?'] },
          { key: 'rewritepov', label: 'Rewrite in a different person', examples: ['Rewrite in third person: "I love reading."', 'Rewrite in first person: "He ran to school."'] },
        ]
      },
      {
        key: 'truefalse', label: 'True or False', questionTypes: [
          { key: 'istrue', label: 'True or False (passage-based)', examples: ['Based on the passage, is this true or false?', 'Which sentence is supported by the text?', 'Which statement is NOT mentioned in the passage?'] },
        ]
      },
      {
        key: 'articles', label: 'Articles (a, an, the)', questionTypes: [
          { key: 'choosearticle', label: 'Choose a, an or the', examples: ['"She bought ___ umbrella."', '"___ apple fell from the tree."', '"He is ___ honest man."'] },
          { key: 'correctarticle', label: 'Correct the article error', examples: ['Fix: "I saw a elephant at the zoo."', 'Fix: "She is an best student."'] },
        ]
      },
      {
        key: 'timewords', label: 'Time Words', questionTypes: [
          { key: 'choosetimeword', label: 'Choose the correct time word', examples: ['"___ finishing dinner, she washed up." (After/Before)', '"He left ___ — without waiting." (right away/later)'] },
          { key: 'sequencetime', label: 'Sequence using time words', examples: ['Order these using: first, then, finally.', '"On the way home, she stopped at the shop." — what does "on the way" mean?'] },
        ]
      },
      {
        key: 'sentencetype', label: 'Commands & Statements', questionTypes: [
          { key: 'iscommand', label: 'Command or statement?', examples: ['"Close the door." — command or statement?', '"The door is closed." — command or statement?', '"Please sit down." — command or statement?'] },
          { key: 'rewritecommand', label: 'Rewrite as a command or statement', examples: ['Rewrite as a command: "You should sit down."', 'Rewrite as a statement: "Eat your vegetables!"'] },
        ]
      },
    ]
  },
  general: {
    label: 'General Ability', icon: '🧩', color: '#F97316', lightBg: '#FFF7ED',
    topics: [
      { key: 'patterns', label: 'Number Patterns', questionTypes: [{ key: 'countby', label: 'Count On / Back Sequences', examples: ['Count on by ones: 525, 526, 527, ___?', 'Count on by tens: 717, 727, 737, ___?'] }, { key: 'missingnum', label: 'Fill in Missing Numbers (Equal steps)', examples: ['436, 438, ___, 442, ___, 446'] }, { key: 'doubtriple', label: 'Doubling / Tripling Patterns', examples: ['Fill in: 1, 2, 4, 8, 16, ___', '3, 6, 12, 24, ___?'] }, { key: 'mixedpattern', label: 'Mixed Addition & Subtraction Patterns', examples: ['Fill in: 2, 4, 3, 5, 4, 6, ___'] }] },
      { key: 'picturepatterns', label: 'Picture Patterns', questionTypes: [{ key: 'shaperotate', label: 'Rotation / Direction Patterns', examples: ['Arrow pointing right, down, right, down — what comes next?'] }, { key: 'shapefill', label: 'Fill / Shading Patterns', examples: ['Hollow triangle, half-filled, solid — what comes next?'] }, { key: 'shapecount', label: 'Count Patterns', examples: ['1 circle, 2 circles, 3 circles — what comes next?'] }, { key: 'shapealt', label: 'Alternating Shape Patterns', examples: ['Triangle, circle, triangle, circle — what comes next?'] }, { key: 'shapematrix', label: 'Shape Matrix (Odd One Out)', examples: ['Which box does not fit the pattern?'] }] },
      { key: 'verbal', label: 'Verbal Reasoning', questionTypes: [{ key: 'analogies', label: 'Word Analogies', examples: ['Hot is to cold as day is to ___?'] }, { key: 'oddoneout', label: 'Odd One Out', examples: ['Find the odd word: apple, orange, banana, hammer, grape'] }, { key: 'synonyms', label: 'Synonyms', examples: ['What is a synonym for "happy"?'] }, { key: 'antonyms', label: 'Antonyms', examples: ['What is an antonym for "cold"?'] }, { key: 'letters', label: 'Letter Patterns', examples: ['A, C, E, G, ___?'] }] },
      { key: 'logic', label: 'Logic & Reasoning', questionTypes: [{ key: 'deduction', label: 'Draw Conclusions', examples: ['All boys in the park play soccer. Half also play ping pong. What can we conclude?'] }, { key: 'findinfo', label: 'Find Information in Text', examples: ['Car A is 4m long. Car B is 2.5m. Car C is 1m longer than A. Which is longest?'] }, { key: 'ordering', label: 'Order Steps / Instructions', examples: ['Order the steps to make tea: Boil water, Pour into cup, Stir, Add milk, Drink'] }, { key: 'coding', label: 'Coding & Decoding', examples: ['If A=1, B=2, C=3 etc, what is the code for 10, 14, 13, 5, 6?'] }] },
    ]
  },
};

const STORAGE_KEY = 'scholarprep_custom_tests';
const loadSavedTests = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
// saveTests writes to localStorage immediately; Supabase sync happens via syncCustomBuilderTests
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
  };
  const totalQuestions = Object.keys(QUESTION_BANK).reduce((sum, sk) => sum + getTotalForSubject(sk), 0);

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
                    const topicDirectCount = getQtCount(sk, topic.key, '_topic');
                    return (
                      <div key={topic.key} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 10px 24px' }}>
                          <button onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))} style={{ fontSize: 10, color: isTExp ? subj.color : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}>{isTExp ? '▼' : '▶'}</button>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }} onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))}>{topic.label}</span>
                          {tTotal > 0 && <span style={{ fontSize: 12, color: subj.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginRight: 4 }}>({tTotal}q)</span>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount - 1)} style={smallBtnStyle}>-</button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: topicDirectCount > 0 ? subj.color : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{topicDirectCount}</span>
                            <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount + 1)} style={smallBtnStyle}>+</button>
                          </div>
                        </div>
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

function SavedTestsList({ tests, customTemplates, onStart, onStartTemplate, onEdit, onDelete, onDeleteTemplate, onCreateNew, onOpenCreator }) {
  const hasAnything = tests.length > 0 || (customTemplates && customTemplates.length > 0);
  if (!hasAnything) return (
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onOpenCreator} style={{ padding: '10px 18px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✨ Question Creator</button>
          <button onClick={onCreateNew} style={{ padding: '10px 18px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Build a test</button>
        </div>
      </div>

      {/* Custom Question Creator Templates */}
      {customTemplates && customTemplates.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            ✨ Custom Question Creator
          </div>
          {customTemplates.map(tmpl => (
            <div key={tmpl.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 8, border: '1.5px solid #FED7AA', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✨</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{tmpl.name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
                  {tmpl.questions?.length || 0} questions · {tmpl.subject || 'Custom'}{tmpl.questionType ? ` · ${tmpl.questionType}` : ''}
                </div>
                {tmpl.templateDescription && (
                  <div style={{ fontSize: 11, color: '#78716C', fontFamily: 'Inter, sans-serif', marginTop: 3, fontStyle: 'italic', lineHeight: 1.4 }}>{tmpl.templateDescription}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => onStartTemplate(tmpl)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#F97316', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>▶ Start</button>
                <button onClick={() => onDeleteTemplate(tmpl.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #FECDD3', background: '#fff', color: '#F43F5E', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Delete</button>
              </div>
            </div>
          ))}
          <div style={{ borderBottom: '1px solid #F1F5F9', margin: '16px 0' }} />
        </div>
      )}

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
        if (sk === 'english') {
          setLoadingMsg('Generating English questions');
          const focusParts = [];
          for (const [tk, qtSel] of Object.entries(topicSel)) {
            for (const [qtk, count] of Object.entries(qtSel)) {
              if (!count) continue;
              const tObj = QUESTION_BANK.english.topics.find(t => t.key === tk);
              const qtObj = tObj?.questionTypes.find(q => q.key === qtk);
              const focusStr = qtk === '_topic'
                ? `${count} question${count > 1 ? 's' : ''} on ${tObj?.label || tk} — any question type from this topic`
                : qtObj ? `${count} question${count > 1 ? 's' : ''} on ${tObj?.label} — ${qtObj.label}` : null;
              if (focusStr) focusParts.push(focusStr);
            }
          }
          const totalEnglish = Object.values(topicSel).reduce((sum, t) => sum + Object.values(t).reduce((a, n) => a + n, 0), 0);
          if (totalEnglish > 0) {
            const focus = focusParts.length > 0 ? focusParts.join(', ') : null;
            const genQs = await generateEnglishQuestions(yearLevel, totalEnglish, focus);
            // Build a flat ordered list of [topic, qtLabel] for tagging questions
            const qtOrder = [];
            for (const [tk, qtSel] of Object.entries(topicSel)) {
              for (const [qtk, count] of Object.entries(qtSel)) {
                if (!count) continue;
                const tObj = QUESTION_BANK.english.topics.find(t => t.key === tk);
                const qtObj = tObj?.questionTypes.find(q => q.key === qtk);
                for (let i = 0; i < count; i++) {
                  qtOrder.push({ topic: tk, questionType: qtObj?.label || tObj?.label || tk });
                }
              }
            }
            allQs.push(...genQs.map((q, i) => ({
              ...q,
              _subj: 'english',
              topic: qtOrder[i]?.topic || q.topic,
              questionType: q.questionType || qtOrder[i]?.questionType,
            })));
          }
          continue;
        }
        if (sk === 'general') {
          setLoadingMsg('Generating general ability questions');
          for (const [tk, qtSel] of Object.entries(topicSel)) {
            for (const [qtk, count] of Object.entries(qtSel)) {
              if (!count) continue;
              const tObj = QUESTION_BANK.general.topics.find(t => t.key === tk);
              const qtObj = tObj?.questionTypes.find(q => q.key === qtk);
              const focusStr = qtk === '_topic'
                ? `${tObj?.label || tk} — any question type from this topic, vary the types`
                : qtObj ? `${tObj?.label} — ${qtObj.label}: ${qtObj.examples?.[0] || ''}` : null;
              const genQs = await generateGeneralAbilityQuestions(yearLevel, count, focusStr);
              const qtLabelG = qtObj?.label || tObj?.label || tk;
              allQs.push(...genQs.slice(0, count).map(q => ({ ...q, _subj: 'general', topic: tk, questionType: qtLabelG })));
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
              const focusStr2 = qtk === '_topic'
                ? `${tObj2?.label || tk} — any question type from this topic, vary the types`
                : qtObj2 ? `${tObj2?.label} - ${qtObj2.label}. Example: ${qtObj2.examples?.[0] || ''}` : null;
              const genQs2 = await generateMathsQuestions(yearLevel, count, focusStr2);
              const qtLabelM = qtObj2?.label || tObj2?.label || tk;
              allQs.push(...genQs2.slice(0, count).map(q => ({ ...q, _subj: 'mathematics', topic: tk, questionType: qtLabelM })));
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
    // Group questions by their actual subject (_subj field) and save each separately
    const bySubject = {};
    questions.forEach((q, i) => {
      const subj = q._subj || test.subject || 'mathematics';
      if (!bySubject[subj]) bySubject[subj] = { qs: [], indices: [] };
      bySubject[subj].qs.push(q);
      bySubject[subj].indices.push(i);
    });
    for (const [subj, { qs, indices }] of Object.entries(bySubject)) {
      const subjSelected = {};
      indices.forEach((origIdx, newIdx) => { subjSelected[newIdx] = selected[origIdx]; });
      const subjCorrect = qs.filter((q, ni) => subjSelected[ni] === q.correct).length;
      await saveTestResult(subj, yearLevel, subjCorrect, qs.length, qs, subjSelected);
    }
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
            {q.questionType && <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>· {q.questionType}</span>}
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: 22, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
            {q.visual && <QuestionVisual visual={q.visual} />}
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0F172A', lineHeight: 1.7, marginBottom: 16, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line' }}>{q.question}</div>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: QUESTION_BANK[qSubjR]?.color, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{QUESTION_BANK[qSubjR]?.icon} {QUESTION_BANK[qSubjR]?.label}</span>
                {q.topic && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: isCorrectQ ? '#ECFDF5' : '#FFF1F2', color: isCorrectQ ? '#059669' : '#BE123C', borderRadius: 100, padding: '1px 8px', fontFamily: 'Inter, sans-serif' }}>
                    {q.topic}
                  </span>
                )}
                {q.questionType && (
                  <span style={{ fontSize: 11, color: '#64748B', background: '#F1F5F9', borderRadius: 100, padding: '1px 8px', fontFamily: 'Inter, sans-serif' }}>
                    {q.questionType}
                  </span>
                )}
              </div>
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


// ── Custom Question Creator ────────────────────────────────────────────────────
// User provides an example question → AI extracts the template → generates similar Qs

const CREATOR_SUBJECTS = [
  { key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#4338CA' },
  { key: 'english', label: 'English', icon: '📝', color: '#7c3aed' },
  { key: 'reading', label: 'Reading', icon: '📖', color: '#059669' },
  { key: 'general', label: 'General Ability', icon: '🧩', color: '#F97316' },
];

// ── Generate questions from a text example ───────────────────────────────────
async function generateFromTemplate(exampleQuestion, subject, questionType, count, yearLevel, imageBase64, imageMediaType) {
  const hasImage = !!imageBase64;

  const system = `You are an expert Australian exam question writer for scholarship and selective entry exams (ACER, AAST, Edutest, NAPLAN) for Year ${yearLevel} students.

${hasImage
      ? `The user has uploaded a photo of a question. Your job is to:
1. READ and UNDERSTAND the question in the image exactly.
2. If the question involves a visual pattern, shape, diagram or table — RECREATE it as closely as possible in text or describe it clearly in the question field.
3. Generate ${count} NEW questions that follow the same template, changing only the numbers/names/items. If the question type is too visual to create variations (e.g. complex shape patterns), recreate the same question ${count} times with minor variations.`
      : `The user will give you an example question. Your job is to:
1. Extract the underlying TEMPLATE — identify what variables (numbers, names, items) can be swapped out while keeping the same structure.
2. Generate ${count} NEW questions following the same template with completely different numbers, names, and items.
3. Each question must require the same reasoning/skill as the example.`}

Return ONLY valid JSON:
{
  "template": "Brief description of the question template (1-2 sentences)",
  "questions": [
    {
      "id": 1,
      "question": "Full question text",
      "options": {"A": "option", "B": "option", "C": "option", "D": "option"},
      "correct": "A",
      "explanation": "Step-by-step working",
      "topic": "${subject}",
      "questionType": "${questionType || 'Custom'}"
    }
  ]
}`;

  const userText = hasImage
    ? `Subject: ${subject}\nQuestion type: ${questionType || 'Custom'}\nGenerate ${count} questions based on the question shown in the image.`
    : `Example question:\n"${exampleQuestion}"\n\nSubject: ${subject}\nQuestion type: ${questionType || 'Custom'}\nGenerate ${count} questions following the same template.`;

  // Use vision endpoint if image provided, text endpoint otherwise
  let rawText;
  if (hasImage) {
    const response = await fetch('/api/claude-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image: imageBase64, mediaType: imageMediaType, systemPrompt: system, userPrompt: userText }),
    });
    rawText = await response.text();
    if (!response.ok || !rawText.trim().startsWith('{')) throw new Error('Failed to analyse image. Please try again.');
    const data = JSON.parse(rawText);
    rawText = data.text || '';
  } else {
    const response = await fetch('/api/claude-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image: null, mediaType: null, systemPrompt: system, userPrompt: userText }),
    });
    rawText = await response.text();
    if (!response.ok || !rawText.trim().startsWith('{')) throw new Error('Failed to generate. Please try again.');
    const data = JSON.parse(rawText);
    rawText = data.text || '';
  }

  const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

// ── Image compression for uploads ────────────────────────────────────────────
function compressImage(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r); height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => resolve({ base64: e.target.result.split(',')[1], mediaType: 'image/jpeg', preview: e.target.result });
        reader.readAsDataURL(blob);
      }, 'image/jpeg', quality);
    };
    img.src = url;
  });
}

// ── Custom Question Creator component ────────────────────────────────────────
function CustomQuestionCreator({ yearLevel, onBack, onSaveTemplate, onLaunch }) {
  const [inputMode, setInputMode] = useState('text');   // 'text' | 'image'
  const [example, setExample] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMediaType, setImageMediaType] = useState('image/jpeg');
  const [imagePreview, setImagePreview] = useState(null);
  const [subject, setSubject] = useState('mathematics');
  const [qType, setQType] = useState('');
  const [tmplName, setTmplName] = useState('');
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState('input');
  const [template, setTemplate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [currentTmplId, setCurrentTmplId] = useState(null);
  const fileRef = useRef(null);
  const subjectColor = CREATOR_SUBJECTS.find(s => s.key === subject)?.color || '#4338CA';

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file);
      setImageBase64(compressed.base64);
      setImageMediaType(compressed.mediaType);
      setImagePreview(compressed.preview);
    } catch (e) { setError('Could not load image. Please try again.'); }
  };

  const handleSaveOnly = async () => {
    if (!tmplName.trim()) { setError('Please give this template a name to save it.'); return; }
    if (!readyToGenerate) { setError(inputMode === 'image' ? 'Please upload a photo first.' : 'Please enter an example question.'); return; }
    setSaving(true); setError('');
    try {
      const tmpl = {
        id: currentTmplId,
        name: tmplName.trim(),
        subject,
        questionType: qType.trim() || null,
        exampleQuestion: example.trim() || '(from image)',
        templateDescription: '',
        questions: [],  // saved without generated questions
      };
      const saved = await onSaveTemplate(tmpl);
      if (saved?.id) setCurrentTmplId(saved.id);
      setSavedName(tmplName.trim());
    } catch (e) { setError('Failed to save. Please try again.'); }
    setSaving(false);
  };

  const handleGenerate = async () => {
    if (inputMode === 'text' && !example.trim()) { setError('Please enter an example question.'); return; }
    if (inputMode === 'image' && !imageBase64) { setError('Please upload a photo of the question.'); return; }
    setError(''); setLoading(true); setPhase('generating');
    try {
      const result = await generateFromTemplate(
        example.trim(), subject, qType.trim(), count, yearLevel,
        inputMode === 'image' ? imageBase64 : null,
        inputMode === 'image' ? imageMediaType : null,
      );
      setTemplate(result.template || '');
      setQuestions(result.questions || []);
      setPhase('preview');
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      setPhase('input');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!tmplName.trim()) { setError('Please give this template a name before saving.'); return; }
    setSaving(true); setError('');
    try {
      const tmpl = {
        id: currentTmplId,
        name: tmplName.trim(),
        subject,
        questionType: qType.trim() || null,
        exampleQuestion: example.trim() || '(from image)',
        templateDescription: template,
        questions,
      };
      const saved = await onSaveTemplate(tmpl);
      if (saved?.id) setCurrentTmplId(saved.id);
      setSavedName(tmplName.trim());
    } catch (e) { setError('Failed to save. Please try again.'); }
    setSaving(false);
  };

  const readyToGenerate = inputMode === 'text' ? example.trim().length > 0 : !!imageBase64;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#5A6A7A', padding: 4 }}>←</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>✨ Custom Question Creator</div>
          <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Give an example question and we'll generate similar ones</div>
        </div>
      </div>

      {/* Input Phase */}
      {(phase === 'input' || phase === 'generating') && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid rgba(67,56,202,0.1)', boxShadow: '0 2px 12px rgba(67,56,202,0.06)' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#F8FAFC', borderRadius: 12, padding: 4 }}>
            {[{ key: 'text', label: '✏️ Type a question' }, { key: 'image', label: '📷 Upload photo' }].map(m => (
              <button key={m.key} onClick={() => setInputMode(m.key)} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                background: inputMode === m.key ? '#fff' : 'transparent',
                fontWeight: inputMode === m.key ? 700 : 500, fontSize: 13,
                color: inputMode === m.key ? subjectColor : '#64748B',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: inputMode === m.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>{m.label}</button>
            ))}
          </div>

          {/* Text input */}
          {inputMode === 'text' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Your example question *</label>
              <textarea
                value={example}
                onChange={e => setExample(e.target.value)}
                placeholder={"e.g. Emma picked 200 strawberries. Noah took 120. In exchange, Noah gave her 95 blueberries. How many fruits does Emma have in the end?"}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#0F172A', resize: 'vertical', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = subjectColor}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>The more specific and complete your example, the better the generated questions will be.</div>
            </div>
          )}

          {/* Image upload */}
          {inputMode === 'image' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Upload a photo of the question *</label>
              {!imagePreview ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
                  style={{ border: '2px dashed #CBD5E1', borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = subjectColor; e.currentTarget.style.background = `${subjectColor}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif' }}>Drop a photo here or click to browse</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>JPG, PNG · Max 10MB · Auto-compressed</div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0])} />
                </div>
              ) : (
                <div>
                  <img src={imagePreview} alt="Question" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 8 }} />
                  <button onClick={() => { setImageBase64(null); setImagePreview(null); setImageMediaType('image/jpeg'); }} style={{ fontSize: 12, color: '#F43F5E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>✕ Remove image</button>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
                AI will read the question from the photo and generate {count} similar ones. For complex visual patterns, it will recreate the original with variations.
              </div>
            </div>
          )}

          {/* Subject + type + count + name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Subject</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CREATOR_SUBJECTS.map(s => (
                  <button key={s.key} onClick={() => setSubject(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: '2px solid', borderColor: subject === s.key ? s.color : '#E5E7EB', background: subject === s.key ? `${s.color}12` : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: subject === s.key ? 700 : 500, color: subject === s.key ? s.color : '#374151', fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.15s' }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Question type <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
                <input value={qType} onChange={e => setQType(e.target.value)} placeholder="e.g. Multi-step word problem" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = subjectColor} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Template name <span style={{ color: '#94A3B8', fontWeight: 400 }}>(to save it)</span></label>
                <input value={tmplName} onChange={e => setTmplName(e.target.value)} placeholder="e.g. Fruit exchange problem" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = subjectColor} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>Give it a name so you can find it again later</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                  How many questions? <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional — leave at 0 to just save)</span>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[0, 3, 5, 10, 15, 20].map(n => (
                    <button key={n} onClick={() => setCount(n)} style={{ width: n === 0 ? 52 : 44, height: 44, borderRadius: 10, border: '2px solid', borderColor: count === n ? subjectColor : '#E5E7EB', background: count === n ? `${subjectColor}12` : '#fff', fontWeight: count === n ? 800 : 500, fontSize: n === 0 ? 11 : 14, color: count === n ? subjectColor : '#374151', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{n === 0 ? 'Save only' : n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Save without generating */}
            <button onClick={handleSaveOnly} disabled={saving || !readyToGenerate || !tmplName.trim()} style={{ flex: count === 0 ? 2 : 1, padding: 14, borderRadius: 12, border: '2px solid #0F172A', background: '#fff', color: saving || !readyToGenerate || !tmplName.trim() ? '#9CA3AF' : '#0F172A', fontSize: 14, fontWeight: 700, cursor: saving || !readyToGenerate || !tmplName.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', borderColor: saving || !readyToGenerate || !tmplName.trim() ? '#E5E7EB' : '#0F172A' }}>
              {saving ? 'Saving…' : savedName ? `✓ Saved` : '💾 Save question'}
            </button>
            {count > 0 && (
              <button onClick={handleGenerate} disabled={loading || !readyToGenerate} style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', background: loading || !readyToGenerate ? '#E5E7EB' : subjectColor, color: loading || !readyToGenerate ? '#9CA3AF' : '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !readyToGenerate ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {loading ? '⏳ Generating…' : `✨ Preview ${count} questions`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generating spinner */}
      {phase === 'generating' && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>{inputMode === 'image' ? 'Reading your question photo…' : 'Analysing your question template…'}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Creating {count} {inputMode === 'image' ? 'similar questions from the image' : 'similar questions with different values'}</div>
        </div>
      )}

      {/* Preview phase */}
      {phase === 'preview' && (
        <div>
          {/* Template + Save row */}
          <div style={{ display: 'grid', gridTemplateColumns: template ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 16 }}>
            {template && (
              <div style={{ background: `${subjectColor}0D`, border: `1.5px solid ${subjectColor}30`, borderRadius: 14, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: subjectColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Template extracted</div>
                <div style={{ fontSize: 13, color: '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{template}</div>
              </div>
            )}
            {/* Save box */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>💾 Save to your library</div>
              <input
                value={tmplName}
                onChange={e => setTmplName(e.target.value)}
                placeholder="Name this template…"
                style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${savedName ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: 8, background: savedName ? '#F0FDF4' : '#fff' }}
              />
              {savedName ? (
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✓ Saved as "{savedName}"</div>
              ) : (
                <button onClick={handleSave} disabled={saving || !tmplName.trim()} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: tmplName.trim() ? '#0F172A' : '#E5E7EB', color: tmplName.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 700, cursor: tmplName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif' }}>
                  {saving ? 'Saving…' : '💾 Save template'}
                </button>
              )}
            </div>
          </div>

          {/* Question previews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {questions.map((q, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: subjectColor, color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Q{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#0F172A', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 8 }}>{q.question}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
                      {Object.entries(q.options || {}).map(([key, val]) => (
                        <div key={key} style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', padding: '4px 8px', borderRadius: 6, background: key === q.correct ? '#DCFCE7' : '#F8FAFC', color: key === q.correct ? '#166534' : '#374151', fontWeight: key === q.correct ? 700 : 400, border: `1px solid ${key === q.correct ? '#86EFAC' : '#E5E7EB'}` }}>
                          {key}. {val}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>⚠️ {error}</div>}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setPhase('input'); setSavedName(''); }} style={{ flex: 1, padding: 13, borderRadius: 12, border: '2px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Edit</button>
            <button onClick={async () => {
              setError(''); setLoading(true); setPhase('generating');
              try {
                const result = await generateFromTemplate(example.trim(), subject, qType.trim(), count, yearLevel, inputMode === 'image' ? imageBase64 : null, inputMode === 'image' ? imageMediaType : null);
                setTemplate(result.template || ''); setQuestions(result.questions || []); setSavedName('');
                setPhase('preview');
              } catch (e) { setError(e.message); setPhase('preview'); }
              setLoading(false);
            }} disabled={loading} style={{ flex: 1, padding: 13, borderRadius: 12, border: `2px solid ${subjectColor}`, background: '#fff', color: subjectColor, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>🔄 {loading ? 'Regenerating…' : 'Regenerate'}</button>
            <button onClick={() => onLaunch(questions, tmplName.trim() || qType.trim() || 'Custom Questions')} style={{ flex: 2, padding: 13, borderRadius: 12, border: 'none', background: subjectColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 14px ${subjectColor}40` }}>
              ▶ Start test ({questions.length} questions)
            </button>
          </div>
        </div>
      )}
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
  const [customTemplates, setCustomTemplates] = useState([]);

  // Load from Supabase on mount
  useEffect(() => {
    loadCustomBuilderTests().then(tests => {
      if (tests && tests.length > 0) setSavedTests(tests);
    }).catch(() => { });
    getCustomTemplates().then(setCustomTemplates).catch(() => { });
  }, []);

  const handleStart = (cfg) => { setActiveTest(cfg); setView('quiz'); };
  const handleSaveAndStart = (cfg) => {
    const updatedTests = editingTest ? savedTests.map(t => t.id === cfg.id ? cfg : t) : [...savedTests, cfg];
    setSavedTests(updatedTests); saveTests(updatedTests); syncCustomBuilderTests(updatedTests).catch(() => { }); setEditingTest(null); setActiveTest(cfg); setView('quiz');
  };
  const handleSaveOnly = (cfg) => {
    const updatedTests2 = editingTest ? savedTests.map(t => t.id === cfg.id ? cfg : t) : [...savedTests, cfg];
    setSavedTests(updatedTests2); saveTests(updatedTests2); syncCustomBuilderTests(updatedTests2).catch(() => { }); setEditingTest(null); setView('list');
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
        {view === 'list' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button onClick={() => setView('creator')} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✨ Question Creator</button>
            <button onClick={() => { setEditingTest(null); setView('builder'); }} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Build a test</button>
          </div>
        )}
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

      {hasAccess && view === 'list' && <SavedTestsList
        tests={savedTests}
        customTemplates={customTemplates}
        onStart={handleStart}
        onStartTemplate={(tmpl) => {
          setActiveTest({ name: tmpl.name, questions: tmpl.questions, subject: tmpl.subject || 'custom', color: '#F97316' });
          setView('quiz');
        }}
        onEdit={(t) => { setEditingTest(t); setView('builder'); }}
        onDelete={(id) => { const u = savedTests.filter(t => t.id !== id); setSavedTests(u); saveTests(u); syncCustomBuilderTests(u).catch(() => { }); }}
        onDeleteTemplate={async (id) => {
          await deleteCustomTemplate(id);
          setCustomTemplates(prev => prev.filter(t => t.id !== id));
        }}
        onCreateNew={() => { setEditingTest(null); setView('builder'); }}
        onOpenCreator={() => setView('creator')}
      />}
      {hasAccess && view === 'builder' && <BuilderScreen onStart={handleStart} onSaveAndStart={handleSaveAndStart} onSaveOnly={handleSaveOnly} editingTest={editingTest} />}
      {hasAccess && view === 'creator' && (
        <CustomQuestionCreator
          yearLevel={yearLevel}
          onBack={() => setView('list')}
          onSaveTemplate={async (tmpl) => {
            const saved = await saveCustomTemplate(tmpl);
            setCustomTemplates(prev => {
              const idx = prev.findIndex(t => t.id === saved.id);
              if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
              return [saved, ...prev];
            });
            return saved;
          }}
          onLaunch={(qs, label) => {
            setActiveTest({ name: label, questions: qs, subject: 'custom', color: '#F97316' });
            setView('quiz');
          }}
        />
      )}

      {hasAccess && view === 'quiz' && activeTest && <QuizScreen test={activeTest} yearLevel={yearLevel} onFinish={(res) => { setResult(res); setView('results'); }} onExit={() => setView(isSaved(activeTest) ? 'list' : 'builder')} />}
      {hasAccess && view === 'results' && result && <ResultsScreen test={activeTest} result={result} onRetry={() => { setView('quiz'); }} onBack={() => setView(isSaved(activeTest) ? 'list' : 'builder')} />}
    </div>
  );
}