import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({id, image, name, price}) => {
    const {currency} = useContext(ShopContext);
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('data:')) return imagePath;
        return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    };

    const mainImage = Array.isArray(image) && image.length > 0 ? image[0] : image;

    return (
        <Link 
            to={`/product/${id}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                color: '#374151',
                cursor: 'pointer',
                display: 'block',
                textDecoration: 'none'
            }}
        >
            <div style={{
                overflow: 'hidden',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                height: '250px'
            }}>
                {!imgError && mainImage ? (
                    <img 
                        src={getImageUrl(mainImage)}
                        alt={name}
                        onError={() => setImgError(true)}
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 300ms ease',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6'
                    }}>
                        <div style={{textAlign: 'center', padding: '16px'}}>
                            <span style={{fontSize: '36px', marginBottom: '8px', display: 'block'}}>📷</span>
                            <p style={{fontSize: '14px', color: '#9ca3af', margin: 0}}>{name}</p>
                        </div>
                    </div>
                )}
            </div>
            <div style={{paddingTop: '12px', paddingBottom: '4px'}}>
                <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                }} title={name}>{name}</p>
                <p style={{fontSize: '14px', fontWeight: 600, marginTop: '4px', margin: 0}}>{currency}{price}</p>
            </div>
        </Link>
    )
}

export default ProductItem