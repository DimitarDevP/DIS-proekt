import './App.css'
import './StatusCodes.css'
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom"
import { useSelector } from 'react-redux'
import { Fragment, useState } from 'react'
import Nav from './Components/Nav/Nav';
import { Navigation } from "./Router"

// console.log = () => { }
console.warn = () => { }
console.error = () => { }



function App() {
  const user = useSelector(state => state.user.currentUser)
  const [expanded, setExpanded] = useState(true)
  const routes = []
  for (const key in Navigation) {
    for (const item of Navigation[key].items) {
      if (item.renderCondition({ currentUser: user === null ? {_type_id : false} : user })) routes.push(<Route path={item.route} component={item.component} />)
    }
  }

  return (
    <div className={expanded === false ? "reduced App" : "App"} id="App">
      <Router>
        {user === null ? <Redirect to="/" /> : <Nav navigation={Navigation} expanded={expanded} setExpanded={setExpanded} />}
        <Switch>
          {routes}
          <Redirect to={"/"} />
        </Switch>
      </Router>
    </div>
  );
}

export default App