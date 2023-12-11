import React from 'react'

const PlayerRow = (props) => {
    return (
        <tr>
            <td><a className="" href={"https://ratings.fide.com/profile/"+props.id} target='_blank'>{props.name}</a></td>
            <td>{props.classical} <span className="small">{props.c_variation}</span></td>
            <td>{props.rapid} <span className="small">{props.r_variation}</span></td>
            <td>{props.blitz} <span className="small">{props.b_variation}</span></td>
        </tr>
    )
}

export default PlayerRow