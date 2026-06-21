import { Component } from "react"

type Props = { children: React.ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
          <h2 style={{ color: "#ef4444" }}>App Crashed</h2>
          <pre style={{ color: "#fbbf24", marginTop: "1rem", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <pre style={{ color: "#94a3b8", marginTop: "1rem", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
