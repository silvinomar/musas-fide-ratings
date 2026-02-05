import React from 'react';

const PlayerRow = (props) => {
    // Helper function to render rating cell
    const renderRatingCell = (ratingData) => {
        // If not rated
        if (ratingData === "Not rated") {
            return (
                <>
                    <span>Not rated</span>
                </>
            );
        }

        // If it's the new object structure
        const rating = ratingData.rating;
        const change = ratingData.change;
        const diff = ratingData.diff;
        const first = ratingData.first;

        // Determine the variation display
        let variationText = '';
        let variationClass = 'small';

        if (first) {
            variationText = 'new';
            variationClass += ' first';
        } else if (change === 'up') {
            variationText = `↗ ${diff}`;
            variationClass += ' up';
        } else if (change === 'down') {
            variationText = `↘ ${Math.abs(diff)}`;
            variationClass += ' down';
        } 

        return (
            <>
                {rating} {variationText && <span className={variationClass}>{variationText}</span>}
            </>
        );
    };

    return (
        <tr>
            <td>
                <a href={`https://ratings.fide.com/profile/${props.id}`} target='_blank' rel='noreferrer'>
                    {props.name}
                </a>
            </td>
            <td>{renderRatingCell(props.standard)}</td>
            <td>{renderRatingCell(props.rapid)}</td>
            <td>{renderRatingCell(props.blitz)}</td>
        </tr>
    );
};

export default PlayerRow;