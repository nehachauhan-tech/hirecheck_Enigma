// Simplified version of use-toast for ResumeUploadDialog
import { useState, useEffect } from "react"

const TOAST_LIMIT = 1

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

let memoryState: any = { toasts: [] }
let listeners: Array<(state: any) => void> = []

function dispatch(action: any) {
    memoryState = {
        ...memoryState,
        toasts: action.type === actionTypes.ADD_TOAST
            ? [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT)
            : memoryState.toasts
    }
    listeners.forEach((listener) => listener(memoryState))
}

function toast({ ...props }: any) {
    const id = genId()
    const update = (props: any) =>
        dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = useState(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    }
}

export { useToast, toast }
