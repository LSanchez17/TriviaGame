// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 * DONE
 */
async function getCategoryIds() {
  const res = await axios.get('https://www.jservice.io/api/categories?count=50');
  let catIds = res.data.map((category) => {
      return category.id;
    });
//console.log(`This is the first array of category ids: ${catIds}`);
  return catIds;
}

/** Return object with data about a category:
 *  Returns { title: "Math", clues: clue-array }
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 * DONE
 */
async function getCategory(catId) {
  let holdCategoryQuestions = [];

  for(let i = 0; i < catId.length; i++){ 
    let res = await axios.get(`https://www.jservice.io/api/category?id=${catId[i]}`);
    holdCategoryQuestions.push(
      { 
        title:  res.data.title, 
        clues: res.data.clues.map(clue => 
        [
         {
          question: clue.question, 
          answer: clue.answer,
          showing: null
         }
        ]) 
      });
  }
  return holdCategoryQuestions;
//console.log(`This is the categoryQuestions Array:`, holdCategoryQuestions)
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable(categoryArr) {
console.log(categoryArr)
  let questionCategory = document.createElement('tr');
  let tableBody = document.querySelector('tbody');
  let tableHead = document.querySelector('thead');

  categoryArr.forEach((element) => {
    let th = document.createElement('th');
    th.innerText = element.title;
    questionCategory.append(th);
  });

  tableHead.append(questionCategory);

  //creates the board, five questions per cat.
  for(let i = 0; i < 5; i++){
    let tr = document.createElement('tr');
      for(let j = 0; j < 6; j++){
        let td = document.createElement('td');
        td.innerText = '?';
        td.id = `${i}${j}`
        td.addEventListener('click', (e) => { handleClick(e)});
        tr.append(td);
      }
    tableBody.append(tr);
  }

  
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  let gridCoordinates = evt.target.id.split('')
  let question = gridCoordinates[0];
  let category = gridCoordinates[1];

  if(categories[category].clues[question][0].showing === null){
    evt.target.innerText = categories[category].clues[question][0].question;
    categories[category].clues[question][0].showing = 'question';
    console.log(categories[category].clues[question][0].showing === 'question')
  }
  else if(categories[category].clues[question][0].showing === 'question'){
    evt.target.innerText = categories[category].clues[question][0].answer;
    categories[category].clues[question][0].showing = 'answer';
  }
  else{
    return;
  }
}

/** Start game:
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  let categoryIds = await getCategoryIds();

  let emptyArr = [];
  let selectionNums = pickNumbers(emptyArr, categoryIds.length);

  let categoryArray = [
      categoryIds[selectionNums[0]], 
      categoryIds[selectionNums[1]],
      categoryIds[selectionNums[2]],
      categoryIds[selectionNums[3]],
      categoryIds[selectionNums[4]],
      categoryIds[selectionNums[5]]
    ]

  let categoriesDetailed = await getCategory(categoryArray);
  //settting access to global var
  categories = categoriesDetailed;

  fillTable(categoriesDetailed);

}


/** On click of restart button, restart game. */
// DONE
let restart = document.querySelector('#restart');
restart.addEventListener('click', () => {
    restartGame();
})

const restartGame = () => {
  let deleteMe = document.getElementById('jeopardy');
  let newTable = document.createElement('table');
  let newTableHead = document.createElement('thead');
  let newTableBody = document.createElement('tbody');
  let body = document.querySelector('body');

  deleteMe.parentNode.removeChild(deleteMe);

  newTable.id = 'jeopardy';
  newTable.append(newTableHead);
  newTable.append(newTableBody);
  body.append(newTable);
  setupAndStart();
}

/** On page load, setup and start & add event handler for clicking clues */
// DONE
document.addEventListener('DOMContentLoaded', () => {
    setupAndStart();
});

//Makes an array of 10 random numbers that are unique 
function pickNumbers(arr, sizes){
    while(arr.length < 10){
        newNum = Math.floor(Math.random() * sizes);
        arr.push(newNum);
        if(arr.every((value, otherValue) => {
          arr.indexOf(value) !== otherValue;
        })
        ){
          arr.pop();
        }
      }
    return arr;
}