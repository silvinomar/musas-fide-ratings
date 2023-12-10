import React from 'react'

const PlayerRow = (props) => {
    return (
        <tr>
            <td><a className="" href={"https://ratings.fide.com/profile/"+props.id} target='_blank'>{props.name}</a></td>
            <td>{props.classical}</td>
            <td>{props.rapid}</td>
            <td>{props.blitz}</td>
        </tr>
    )
}

export default PlayerRow