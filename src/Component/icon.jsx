export function LikeIcon({ style , width = 24 , height = 24 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            fill= 'currentColor'
            viewBox="0 0 24 24"
            style={style}
        >
            <path d="M20 8h-5.61l1.12-3.37c.2-.61.1-1.28-.27-1.8-.38-.52-.98-.83-1.62-.83h-1.61c-.3 0-.58.13-.77.36L6.54 8H4.01c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2ZM6 19H4v-9h2zm14-7.18L17.31 19H8V9.36L12.47 4h1.15l-1.56 4.68a1.01 1.01 0 0 0 .95 1.32h7v1.82Z" />
        </svg>
    );
}

export function DislikeIcon({ style , width = 24 , height = 24 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
            fill="currentColor" viewBox="0 0 24 24" style={style}>
            <path d="M20 3H6.69a2 2 0 0 0-1.87 1.3l-2.76 7.35c-.04.11-.06.23-.06.35v2c0 1.1.9 2 2 2h5.61l-1.12 3.37c-.2.61-.1 1.28.27 1.8.38.52.98.83 1.62.83h1.61c.3 0 .58-.13.77-.36l4.7-5.64h2.53c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-4 11.64L11.53 20h-1.15l1.56-4.68a1.01 1.01 0 0 0-.95-1.32h-7v-1.82L6.68 5h9.31v9.64Zm4-.64h-2V5h2z" />
        </svg>
    );
}

export const CommentsIcon = ({ 
  size = 24, 
  color = "currentColor", 
  strokeWidth = 2 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
};

export const ReplyIcon = ({ size = 16, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
        fill={color} viewBox="0 0 24 24" >
        <path d="m9,10h3c2.21,0,4,1.79,4,4v6h2v-6c0-3.31-2.69-6-6-6h-6v-4l-6,5,6,5v-4Z" />
    </svg>
);

export function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ExpandLess() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 8.029l-6 6 1.414 1.414L12 10.857l4.586 4.586 1.414-1.414-6-6z" />
    </svg>
  )
}

export function ExpandMore() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15.971l-6-6 1.414-1.414L12 13.143l4.586-4.586 1.414 1.414-6 6z" />
    </svg>
  )
}

export function PinIcon({ color , fill = 'none'}) {
  return (
    <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="15" height="15" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>

  )
}

export function ReportIcon({width = 24 , height = 24}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5.64 5.64L18.36 18.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}