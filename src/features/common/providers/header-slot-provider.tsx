import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode
} from "react"

interface HeaderSlotContextValue {
  slot: ReactNode
  setSlot: (node: ReactNode) => void
}

const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)

export const HeaderSlotProvider = ({ children }: { children: ReactNode }) => {
  const [slot, setSlotState] = useState<ReactNode>(null)

  const setSlot = useCallback((node: ReactNode) => {
    setSlotState(node)
  }, [])

  return (
    <HeaderSlotContext.Provider value={{ slot, setSlot }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}

const useHeaderSlotContext = () => {
  const ctx = useContext(HeaderSlotContext)
  if (!ctx)
    throw new Error("useHeaderSlot must be used inside HeaderSlotProvider")
  return ctx
}

export const useHeaderSlot = (node: ReactNode) => {
  const { setSlot } = useHeaderSlotContext()

  useEffect(() => {
    setSlot(node)
    return () => setSlot(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSlot])
}

export const HeaderSlot = () => {
  const { slot } = useHeaderSlotContext()
  return <>{slot}</>
}
