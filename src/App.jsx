import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import {nanoid} from "nanoid"
import "./App.css"
import "react-mde/lib/styles/css/react-mde-all.css";
// this allows to listen for changes in db firestore, then act accordingly in the code, useEffect it.
import {
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc, 
  setDoc } from "firebase/firestore"
import { notesCollection , db} from "../firebase"

export default function App() {
    
    const [notes, setNotes] = React.useState(
      // LAZY STATE INITIALIZATION - implicit return
       //() => JSON.parse(localStorage.getItem("notes")) || []
      []
    )
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const [tempNoteText, setTempNoteText] = React.useState("")
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

    const currentNote = notes.find(note => note.id === currentNoteId)

    React.useEffect(() => {
      const unsubscribe = onSnapshot(notesCollection, function (snapshot){
        //sync up local notes Arrray with the snapshot data

        // We are creating a Wensocket connection with the db (a listener)
        // whenever we have a listener like this we have to give react 
        // a way to unsubsribe from this listner if this componenet is unmounted 
        // to avoid memory-leaks
        // useEffect returns a callback function to clean up
        console.log("THINGS ARE CHANGING")
        const notesArr = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        setNotes(notesArr)
      })
      return unsubscribe
    }, [])

    React.useEffect( () => {
      if(!currentNoteId){
        setCurrentNoteId(notes[0]?.id)
      }
    }, [notes])
    
    React.useEffect( () => {
      if(currentNote){
        setTempNoteText(currentNote.body)
      }
    }, [currentNote])

    // Debouncing == There are third-party libraries to do debouncing
    React.useEffect( () => {
      const timeoutId = setTimeout(() => {
        updateNote(tempNoteText)
      }, 800)
      return () => clearTimeout(timeoutId)
    }, [tempNoteText])

    async function createNewNote() {
        const newNote = {
            //id: nanoid(),
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        // setNotes(prevNotes => [newNote, ...prevNotes])
        // setCurrentNoteId(newNote.id)
        const newNoteReference = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteReference.id)
    }
    
    async function updateNote(text) {
      // takes the text and sends the ddata to firebase
      const docRef = doc(db, "notes", currentNoteId)
      await setDoc(
          docRef,
          {body: text, updatedAt: Date.now()}, 
          {merge: true}
        )
      // setNotes(oldNotes => {
      //   const newArray = []
        
      //   for(let i=0; i< oldNotes.length; i++){
      //     const oldNote = oldNotes[i]
      //     if(oldNote.id === currentNoteId){
      //       newArray.unshift({...oldNote, body: text})
      //     } else {
      //       newArray.push(oldNote)
      //     }
      //   }
      //   return newArray
      // })
        // setNotes(oldNotes => oldNotes.map(oldNote => {
        //     return oldNote.id === currentNoteId
        //         ? { ...oldNote, body: text }
        //         : oldNote
        // }))
    }
    
    async function deleteNote(/*event, */noteId){
      //event.stopPropagation()
      //setNotes(oldNotes => oldNotes.filter(note => note.id !== noteId))
      const docRef = doc(db, "notes", noteId)
      await deleteDoc(docRef)
    }

    function findCurrentNote() {
        return notes.find(note => {
            return note.id === currentNoteId
        }) || notes[0]
    }
    
    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={sortedNotes}
                    currentNote={findCurrentNote()}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote = {deleteNote}
                />
                {
                // currentNoteId && 
                // notes.length > 0 &&
                <Editor 
                    //currentNote={findCurrentNote()} 
                    tempNoteText={tempNoteText}
                    setTempNoteText={setTempNoteText}
                    //updateNote={updateNote} 
                />
                }
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}
