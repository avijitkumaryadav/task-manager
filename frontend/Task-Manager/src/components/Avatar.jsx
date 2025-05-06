// import React from "react";

// const Avatar = ({ avatars, maxVisible = 3 }) => {
//   return (
//     <div className="space-y-3">
//       {avatars.slice(0, maxVisible).map((avatar, index) => (
//         <div key={index} className="flex items-center gap-3">
//           {/* Avatar Image */}
//           <img
//             src={avatar.image}
//             alt={`Avatar ${index}`}
//             className="w-9 h-9 rounded-full border-2 border-white shadow"
//           />

//           {/* User Progress */}
//           <div className="flex-1">
//             <p className="text-sm text-gray-800 font-medium">
//               {avatar.name || `User ${index + 1}`}
//             </p>
//             <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
//               <div
//                 className="h-2 bg-blue-500 rounded-full"
//                 style={{ width: `${avatar.progress || 0}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* "+X more" if avatars exceed maxVisible */}
//       {avatars.length > maxVisible && (
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 flex items-center justify-center bg-blue-100 text-sm font-medium rounded-full border-2 border-white shadow">
//             +{avatars.length - maxVisible}
//           </div>
//           <p className="text-gray-600 text-sm">more users assigned</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Avatar;
