import React from 'react'

const PlayerRow = (props) => {
    return (
        <tr>
            <td><a className="" href={"https://ratings.fide.com/profile/"+props.id} target='_blank' rel='noreferrer'>{props.name}</a></td>
            <td>{props.classical} <span className={"small "+(props.c_variation>0) + " " + (props.c_variation === "new" ? "first" : "")}>{props.c_variation}</span></td>
            <td>{props.rapid} <span className={"small "+(props.r_variation>0) + " " + (props.r_variation === "new" ? "first" : "")}>{props.r_variation}</span></td>
            <td>{props.blitz} <span className={"small "+(props.b_variation>0) + " " + (props.b_variation === "new" ? "first" : "")}>{props.b_variation}</span></td>
        </tr>
    )
}

export default PlayerRow